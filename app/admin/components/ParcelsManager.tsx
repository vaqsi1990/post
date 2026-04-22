'use client';

import { Suspense, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ADMIN_PARCEL_PAGE_SIZE } from '@/lib/adminParcelList';
import { parcelOriginKey } from '@/lib/parcelOriginKey';
import ParcelsTable from './ParcelsTable';
import IncomingCountryHub from './IncomingCountryHub';

export type Parcel = {
  id: string;
  trackingNumber: string;
  status: string;
  price: number;
  currency: string;
  weight: number | null;
  originCountry: string | null;
  quantity: number;
  customerName: string;
  createdAt: string;
  filePath: string | null;
  shippingAmount?: number | null;
  courierServiceRequested: boolean;
  courierFeeAmount: number | null;
  payableAmount: number | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
  };
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    employeeCountry: string | null;
  } | null;
};

export type ParcelsManagerProps = {
  initialParcels: Parcel[];
  currentStatus: string;
  allowDelete?: boolean;
  /** ქვეყნის დროშების ჰაბი, შიგნით — არჩეული ქვეყნის ამანათები (`?country=`) */
  countryHub?: boolean;
};

function HubSuspenseFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
    </div>
  );
}

function ParcelsManagerWithCountryUrl(props: ParcelsManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const countryFilter = searchParams.get('country')?.trim().toLowerCase() ?? null;

  const onSelectCountry = (key: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('country', key);
    p.set('page', '1');
    p.delete('cursor');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const onClearCountry = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('country');
    p.delete('page');
    p.delete('cursor');
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <ParcelsManagerContent
      {...props}
      incomingHub
      countryFilter={countryFilter}
      onSelectCountry={onSelectCountry}
      onClearCountry={onClearCountry}
    />
  );
}

type ParcelsManagerContentProps = ParcelsManagerProps & {
  incomingHub?: boolean;
  countryFilter?: string | null;
  onSelectCountry?: (key: string) => void;
  onClearCountry?: () => void;
};

function ParcelsManagerContent({
  initialParcels,
  currentStatus,
  allowDelete = true,
  incomingHub = false,
  countryFilter = null,
  onSelectCountry,
  onClearCountry,
}: ParcelsManagerContentProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10) || 1,
  );
  const cursor = searchParams.get('cursor')?.trim() || null;
  const isEn = locale === 'en';
  const isRu = locale === 'ru';
  const backLabel =
    isRu ? '← Все страны' : isEn ? '← All countries' : '← ყველა ქვეყანა';
  const prevLabel = isRu ? 'Назад' : isEn ? 'Previous' : 'წინა';
  const nextLabel = isRu ? 'Вперёд' : isEn ? 'Next' : 'შემდეგი';
  const pageLabel = (cur: number, tot: number) =>
    isRu
      ? `Стр. ${cur} из ${tot}`
      : isEn
        ? `Page ${cur} of ${tot}`
        : `${cur} / ${tot}`;

  const [parcels, setParcels] = useState(initialParcels);
  const [totalPages, setTotalPages] = useState(1);
  const [originCounts, setOriginCounts] = useState<Record<
    string,
    number
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const lastSuccessfulFetchAtRef = useRef<number>(Date.now());
  const refetchOnFocusStaleMs = 30_000;

  const setPageAndCursor = (nextPage: number, nextCursorValue: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(nextPage));
    if (nextCursorValue) p.set('cursor', nextCursorValue);
    else p.delete('cursor');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // If we're on the first page, a persisted `cursor` in the URL will make the
    // client fetch older pages and "lose" newly created parcels after refresh.
    if (page === 1 && cursor) {
      const p = new URLSearchParams(searchParams.toString());
      p.delete('cursor');
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchParcels = async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        params.set('status', currentStatus);
        params.set('limit', String(ADMIN_PARCEL_PAGE_SIZE));
        if (countryFilter) {
          params.set('country', countryFilter);
        }
        // Only use cursor for forward pagination; page=1 must always show newest.
        if (cursor && page > 1) {
          params.set('cursor', cursor);
        }
        const res = await fetch(`/api/admin/parcels?${params.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          setLoadError(
            `Failed to load parcels (${res.status}). ${text ? text.slice(0, 200) : ''}`.trim()
          );
          return;
        }
        const data = await res.json().catch(() => null);
        if (!data) {
          setLoadError('Failed to load parcels (invalid response).');
          return;
        }
        if (data.parcels) {
          // Polling updates are non-urgent; keep INP snappy.
          startTransition(() => setParcels(data.parcels));
        }
        startTransition(() => setNextCursor(typeof data.nextCursor === 'string' ? data.nextCursor : null));
        if (typeof data.totalPages === 'number') {
          startTransition(() => setTotalPages(Math.max(1, data.totalPages)));
        }
        if (data.originCounts && typeof data.originCounts === 'object') {
          startTransition(() =>
            setOriginCounts(data.originCounts as Record<string, number>)
          );
        }
        lastSuccessfulFetchAtRef.current = Date.now();
      } catch (error) {
        console.error('Failed to fetch parcels:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    const shouldShowLoading =
      isInitialMount.current && initialParcels.length === 0;
    fetchParcels(shouldShowLoading || !isInitialMount.current);
    isInitialMount.current = false;

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          fetchParcels(false);
        }
      }, 8000);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Avoid "refreshing" UI on quick tab switches; only refetch if data is stale.
        const isStale =
          Date.now() - lastSuccessfulFetchAtRef.current > refetchOnFocusStaleMs;
        if (isStale) {
          fetchParcels(false);
        }
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStatus, page, countryFilter, cursor]);

  // NOTE: prev-page navigation with pure keyset pagination requires cursor history.
  // We currently keep UX simple: "Previous" jumps back to first page.

  const handleParcelUpdated = (updatedParcel: Parcel) => {
    if (updatedParcel.status !== currentStatus) {
      setParcels((prev) => prev.filter((p) => p.id !== updatedParcel.id));
    } else {
      setParcels((prev) =>
        prev.map((p) => (p.id === updatedParcel.id ? updatedParcel : p))
      );
    }
  };

  const filteredParcels = useMemo(() => {
    if (!incomingHub || !countryFilter) return parcels;
    return parcels.filter((p) => parcelOriginKey(p.originCountry) === countryFilter);
  }, [incomingHub, countryFilter, parcels]);

  const showMainHub = incomingHub && !countryFilter;
  const showCountryParcels = incomingHub && countryFilter;

  const tableParcels = incomingHub ? filteredParcels : parcels;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white bg-opacity-75">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
            <p className="text-[16px] text-gray-600">იტვირთება...</p>
          </div>
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {loadError}
        </div>
      )}
      {showMainHub ? (
        <IncomingCountryHub
          parcels={parcels}
          countsByOrigin={originCounts}
          onSelectCountry={onSelectCountry!}
        />
      ) : (
        <>
          {showCountryParcels ? (
            <div className="mb-4">
              <button
                type="button"
                onClick={onClearCountry}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-[15px] font-medium text-black transition hover:bg-gray-50"
              >
                {backLabel}
              </button>
            </div>
          ) : null}
          <ParcelsTable
            parcels={tableParcels}
            currentStatus={currentStatus}
            allowDelete={allowDelete}
            onParcelUpdated={handleParcelUpdated}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[14px] text-gray-800">
              {page > 1 ? (
                // Cursor-based prev requires knowing the cursor of the previous page.
                // We keep UX simple: fall back to first page when going back.
                <button
                  type="button"
                  onClick={() => setPageAndCursor(1, null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
                >
                  {prevLabel}
                </button>
              ) : (
                <span className="rounded-lg border border-transparent px-4 py-2 text-gray-400">
                  {prevLabel}
                </span>
              )}
              <span className="tabular-nums text-[15px] font-medium text-gray-700">
                {pageLabel(page, totalPages)}
              </span>
              {page < totalPages && nextCursor ? (
                <button
                  type="button"
                  onClick={() => setPageAndCursor(page + 1, nextCursor)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
                >
                  {nextLabel}
                </button>
              ) : (
                <span className="rounded-lg border border-transparent px-4 py-2 text-gray-400">
                  {nextLabel}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ParcelsManager(props: ParcelsManagerProps) {
  if (props.countryHub) {
    return (
      <Suspense fallback={<HubSuspenseFallback />}>
        <ParcelsManagerWithCountryUrl {...props} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<HubSuspenseFallback />}>
      <ParcelsManagerContent {...props} />
    </Suspense>
  );
}
