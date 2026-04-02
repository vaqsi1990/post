'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';

const PIPELINE = [
  'pending',
  'in_transit',
  'arrived',
  'region',
  'delivered',
] as const;

const KNOWN_STATUS = new Set<string>([
  ...PIPELINE,
  'ready_for_pickup',
  'cancelled',
]);

type PipelineStatus = (typeof PIPELINE)[number];

type ParcelPayload = {
  trackingNumber: string;
  status: string;
  originCountry: string | null;
  onlineShop: string;
  weight: number | null;
  createdAt: string;
  shippedAt: string | null;
  arrivedAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  events: {
    id: string;
    status: string;
    location: string | null;
    description: string | null;
    createdAt: string;
  }[];
};

function isPipelineStatus(s: string): s is PipelineStatus {
  return (PIPELINE as readonly string[]).includes(s);
}

function pipelineIndex(status: string): number {
  if (status === 'ready_for_pickup') {
    return PIPELINE.indexOf('region');
  }
  if (!isPipelineStatus(status)) return -1;
  return PIPELINE.indexOf(status);
}

function TrackingSearch() {
  const t = useTranslations('trackingPage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code')?.trim() ?? '';

  const [input, setInput] = useState(codeFromUrl);
  const [result, setResult] = useState<ParcelPayload | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchByCode = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code) {
        setErrorKey('errors.code_required');
        setResult(null);
        return;
      }
      setLoading(true);
      setErrorKey(null);
      try {
        const res = await fetch(
          `/api/tracking?code=${encodeURIComponent(code)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          const key =
            data.error === 'not_found'
              ? 'errors.not_found'
              : data.error === 'code_invalid'
                ? 'errors.code_invalid'
                : data.error === 'code_required'
                  ? 'errors.code_required'
                  : 'errors.not_found';
          setErrorKey(key);
          setResult(null);
          return;
        }
        setResult(data.parcel as ParcelPayload);
      } catch {
        setErrorKey('errors.network');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setInput(codeFromUrl);
    if (codeFromUrl) void fetchByCode(codeFromUrl);
    else {
      setResult(null);
      setErrorKey(null);
    }
  }, [codeFromUrl, fetchByCode]);

  const statusLabel = (status: string) =>
    KNOWN_STATUS.has(status)
      ? (t as (k: string) => string)(`status.${status}`)
      : status;

  const formatWhen = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) {
      setErrorKey('errors.code_required');
      setResult(null);
      router.replace(pathname);
      return;
    }
    router.replace(`${pathname}?code=${encodeURIComponent(q)}`);
  };

  const copyNumber = async () => {
    if (!result?.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(result.trackingNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const copyShareLink = async () => {
    if (!result?.trackingNumber) return;
    const url = new URL(window.location.href);
    url.searchParams.set('code', result.trackingNumber);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const progressIdx = result ? pipelineIndex(result.status) : -1;
  const isCancelled = result?.status === 'cancelled';

  const milestoneDates = useMemo(() => {
    if (!result) return null;
    return {
      shipped: result.shippedAt,
      arrived: result.arrivedAt,
      ready: result.readyAt,
      delivered: result.deliveredAt,
    };
  }, [result]);

  return (
    <div className="mx-auto mt-14 w-full max-w-3xl px-4 pb-20 pt-8 md:pt-12">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-balance text-2xl font-extrabold tracking-tight text-[#3a5bff] md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-gray-600 md:text-base">
          {t('subtitle')}
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <label className="sr-only" htmlFor="tracking-code-input">
          {t('placeholder')}
        </label>
        <input
          id="tracking-code-input"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[48px] flex-1 rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 shadow-sm outline-none ring-[#3a5bff]/30 transition placeholder:text-gray-400 focus:border-[#3a5bff] focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] shrink-0 rounded-xl bg-[#3a5bff] px-8 text-[17px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t('searching') : t('search')}
        </button>
      </form>
      <p className="mt-2 text-[17px] text-gray-500">{t('emptyHint')}</p>

      {errorKey && (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[17px] text-red-800"
          role="alert"
        >
          {t(errorKey as 'errors.not_found')}
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[17px] font-semibold uppercase tracking-wider text-gray-500">
                  {t('currentStatus')}
                </p>
                <p className="mt-1 text-[17px] font-bold text-gray-900">
                  {statusLabel(result.status)}
                </p>
                <p className="mt-2 font-mono text-[17px] text-gray-800">
                  {result.trackingNumber}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyNumber}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[17px] font-medium text-gray-800 hover:bg-gray-100"
                >
                  {copied ? t('copied') : t('copy')}
                </button>
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="rounded-lg border border-[#3a5bff]/30 bg-[#3a5bff]/5 px-3 py-2 text-[13px] font-medium text-[#3a5bff] hover:bg-[#3a5bff]/10"
                >
                  {t('copyShareLink')}
                </button>
              </div>
            </div>
            <p className="mt-3 text-[15px] text-gray-500">{t('shareHint')}</p>

            <dl className="mt-6 grid gap-3 border-t border-gray-100 pt-6 text-[17px] sm:grid-cols-2">
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-gray-500">{t('registeredAt')}</dt>
                <dd className="font-medium text-gray-900">
                  {formatWhen(result.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-gray-500">{t('weight')}</dt>
                <dd className="font-medium text-gray-900">
                  {result.weight != null && result.weight > 0
                    ? `${result.weight} kg`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-gray-500">{t('origin')}</dt>
                <dd className="font-medium text-gray-900">
                  {formatOriginCountryLabel(result.originCountry)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-gray-500">{t('shop')}</dt>
                <dd className="font-medium text-gray-900">
                  {result.onlineShop?.trim() || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {isCancelled ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
              {statusLabel('cancelled')}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="mb-5 text-[17px] font-semibold uppercase tracking-wider text-gray-500">
                {t('progressTitle')}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {PIPELINE.map((step, i) => {
                  const done = progressIdx >= i;
                  const current = progressIdx === i;
                  const dateExtra =
                    step === 'in_transit'
                      ? milestoneDates?.shipped
                      : step === 'arrived'
                        ? milestoneDates?.arrived
                        : step === 'delivered'
                          ? milestoneDates?.delivered
                          : null;
                  return (
                    <div
                      key={step}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-slate-50/80 p-3 lg:flex-col lg:items-center lg:text-center"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                          done
                            ? 'bg-[#3a5bff] text-white'
                            : 'border-2 border-gray-200 bg-white text-gray-400'
                        } ${current ? 'ring-4 ring-[#3a5bff]/25' : ''}`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[17px] font-semibold leading-snug ${done ? 'text-gray-900' : 'text-gray-400'}`}
                        >
                          {statusLabel(step)}
                        </p>
                        {dateExtra && (
                          <p className="mt-1 text-[11px] text-gray-500">
                            {formatWhen(dateExtra)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-4 text-[17px] font-semibold uppercase tracking-wider text-gray-500">
              {t('timelineTitle')}
            </h2>
            {result.events.length === 0 ? (
              <p className="text-[17px] leading-relaxed text-gray-600">
                {t('noEvents')}
              </p>
            ) : (
              <ul className="space-y-0 border-l-2 border-[#3a5bff]/20 pl-4">
                {[...result.events].reverse().map((ev) => (
                  <li
                    key={ev.id}
                    className="relative pb-6 pl-2 before:absolute before:-left-[21px] before:top-1.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-[#3a5bff] before:content-[''] last:pb-0"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[17px] font-semibold text-gray-900">
                        {statusLabel(ev.status)}
                      </span>
                      <time
                        className="text-[17px] text-gray-500"
                        dateTime={ev.createdAt}
                      >
                        {formatWhen(ev.createdAt)}
                      </time>
                    </div>
                    {ev.location && (
                      <p className="mt-1 text-[17px] text-gray-600">
                        {ev.location}
                      </p>
                    )}
                    {ev.description && (
                      <p className="mt-1 text-[17px] text-gray-700">
                        {ev.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
          …
        </div>
      }
    >
      <TrackingSearch />
    </Suspense>
  );
}
