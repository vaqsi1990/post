'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { formatOriginCountryLabel } from '@/lib/formatOriginCountry';

type ParcelResult = {
  id: string;
  trackingNumber: string;
  status: string;
  weight: number;
  price: number;
  currency: string;
  originCountry: string;
  createdAt: string;
  tracking: { status: string; location: string | null; description: string | null; createdAt: string }[];
};

type SupportedLocale = 'ka' | 'en' | 'ru';

const COPY: Record<SupportedLocale, {
  h1: string;
  back: string;
  loading: string;
  noCodePrefix: string;
  noCodeSuffix: string;
  dashboard: string;
  errorGeneric: string;
  errorNetwork: string;
  fields: {
    trackingCode: string;
    status: string;
    weight: string;
    country: string;
  };
  history: string;
  statuses: Record<string, string>;
}> = {
  ka: {
    h1: 'ამანათის თრექინგი',
    back: '← დაბრუნება',
    loading: 'იტვირთება...',
    dashboard: 'დაშბორდი',
    noCodePrefix: 'გამოიყენეთ დაშბორდის ველი თრექინგ კოდის საძიებლად ან',
    noCodeSuffix: '.',
    errorGeneric: 'შეცდომა',
    errorNetwork: 'შეცდომა ქსელში',
    fields: {
      trackingCode: 'თრექინგ კოდი',
      status: 'სტატუსი',
      weight: 'წონა',
      country: 'ქვეყანა',
    },
    history: 'ისტორია',
    statuses: {
      pending: 'საწყობი',
      in_transit: 'გზაში',
      arrived: 'ჩამოსული',
      region: 'რეგიონში',
      ready_for_pickup: 'მისაღებად მზად',
      stopped: 'გაჩერებული',
      delivered: 'გატანილი',
      cancelled: 'გაუქმებული',
    },
  },
  en: {
    h1: 'Parcel tracking',
    back: '← Back',
    loading: 'Loading...',
    dashboard: 'Dashboard',
    noCodePrefix: 'Use the dashboard field to search by tracking code or go to',
    noCodeSuffix: '.',
    errorGeneric: 'Error',
    errorNetwork: 'Network error',
    fields: {
      trackingCode: 'Tracking code',
      status: 'Status',
      weight: 'Weight',
      country: 'Country',
    },
    history: 'History',
    statuses: {
      pending: 'In warehouse',
      in_transit: 'In transit',
      arrived: 'Arrived',
      region: 'In region',
      ready_for_pickup: 'Ready for pickup',
      stopped: 'Stopped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
  },
  ru: {
    h1: 'Отслеживание посылки',
    back: '← Назад',
    loading: 'Загрузка...',
    dashboard: 'Панель',
    noCodePrefix: 'Используйте поле на панели для поиска по трек‑коду или перейдите в',
    noCodeSuffix: '.',
    errorGeneric: 'Ошибка',
    errorNetwork: 'Ошибка сети',
    fields: {
      trackingCode: 'Трек‑код',
      status: 'Статус',
      weight: 'Вес',
      country: 'Страна',
    },
    history: 'История',
    statuses: {
      pending: 'На складе',
      in_transit: 'В пути',
      arrived: 'Прибыло',
      region: 'В регионе',
      ready_for_pickup: 'Готово к выдаче',
      stopped: 'Остановлено',
      delivered: 'Выдана',
      cancelled: 'Отменена',
    },
  },
};

function getLocaleFromCookie(): SupportedLocale {
  if (typeof document === 'undefined') return 'ka';
  const raw = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  const locale = (raw ? decodeURIComponent(raw) : '').toLowerCase();
  if (locale === 'en' || locale === 'ru' || locale === 'ka') return locale;
  return 'ka';
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const [result, setResult] = useState<ParcelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!code);
  const [locale, setLocale] = useState<SupportedLocale>('ka');

  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  const t = COPY[locale];

  const fetchTracking = useCallback(async (trackingCode: string) => {
    if (!trackingCode.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/tracking?code=${encodeURIComponent(trackingCode.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.errorGeneric);
        setResult(null);
        return;
      }
      setResult(data.parcel);
    } catch {
      setError(t.errorNetwork);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [t.errorGeneric, t.errorNetwork]);

  useEffect(() => {
    if (code) fetchTracking(code);
    else setLoading(false);
  }, [code, fetchTracking]);

  return (
    <div className=" bg-gray-100 py-8">
      <div className="mx-auto mt-24 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{t.h1}</h1>
            <Link
              href="/dashboard"
              className="text-[15px] font-medium hover:text-black"
            >
              {t.back}
            </Link>
          </div>

          {!code ? (
            <p className="text-[15px] text-black">
              {t.noCodePrefix}{' '}
              <Link href="/dashboard" className="text-amber-600 hover:underline">
                {t.dashboard}
              </Link>
              {t.noCodeSuffix}
            </p>
          ) : loading ? (
            <p className="text-[15px] text-black">{t.loading}</p>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
              {error}
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <div className="grid grid-cols-2 gap-2 text-[14px]">
                  <span className="text-black">{t.fields.trackingCode}</span>
                  <span className="font-medium text-black">{result.trackingNumber}</span>
                  <span className="text-black">{t.fields.status}</span>
                  <span className="font-medium text-black">
                    {t.statuses[result.status] || result.status}
                  </span>
                  <span className="text-black">{t.fields.weight}</span>
                  <span className="text-black">{result.weight} kg</span>
                  <span className="text-black">{t.fields.country}</span>
                  <span className="text-black">
                    {formatOriginCountryLabel(result.originCountry)}
                  </span>
                </div>
              </div>
              {result.tracking.length > 0 && (
                <div>
                  <h2 className="mb-2 text-[14px] font-semibold text-black">{t.history}</h2>
                  <ul className="space-y-2">
                    {result.tracking.map((t, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded border border-gray-100 bg-white px-3 py-2 text-[14px]"
                      >
                        <span className="font-medium text-black">
                          {COPY[locale].statuses[t.status] || t.status}
                        </span>
                        {t.location && <span className="text-gray-600">{t.location}</span>}
                        {t.description && <span className="text-black">{t.description}</span>}
                        <span className="ml-auto text-gray-400">
                          {new Date(t.createdAt).toLocaleDateString(
                            locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ka-GE'
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DashboardTrackingPage() {
  return (
    <Suspense fallback={<div className=" bg-gray-100 py-8 flex items-center justify-center"><p className="text-black">Loading...</p></div>}>
      <TrackingContent />
    </Suspense>
  );
}
