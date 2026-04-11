'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GB, US, CN, IT, GR, ES, FR, DE, TR } from 'country-flag-icons/react/3x2';
import { parcelOriginLabelKey } from '@/lib/parcelOriginLabels';
import {
  UNKNOWN_COUNTRY_KEY,
  parcelOriginKey,
} from '@/lib/parcelOriginKey';

type FlagComponent = (props: { title?: string; className?: string }) => ReactNode;

const FLAGS: Record<string, FlagComponent> = {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
};

const CODE_TO_FLAG: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  it: 'IT',
  gr: 'GR',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  tr: 'TR',
};

const ORIGIN_ORDER = ['uk', 'us', 'cn', 'it', 'gr', 'es', 'fr', 'de', 'tr'];

function sortCountryKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    if (a === UNKNOWN_COUNTRY_KEY) return 1;
    if (b === UNKNOWN_COUNTRY_KEY) return -1;
    const ia = ORIGIN_ORDER.indexOf(a);
    const ib = ORIGIN_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

type HubParcel = { originCountry: string | null };

type IncomingCountryHubProps = {
  parcels: HubParcel[];
  /** SSR/API-დან სრული რაოდენობები ქვეყნებით (პაგინაციისას parcels მოკლე სიაა) */
  countsByOrigin?: Record<string, number> | null;
  onSelectCountry: (countryKey: string) => void;
};

export default function IncomingCountryHub({
  parcels,
  countsByOrigin,
  onSelectCountry,
}: IncomingCountryHubProps) {
  const locale = useLocale();
  const isEn = locale === 'en';
  const isRu = locale === 'ru';
  const tParcels = useTranslations('parcels');

  const noParcels =
    isRu ? 'Пока нет ни одной посылки.' : isEn ? 'No parcels yet.' : 'ჯერ არცერთი ამანათი არ არის.';
  const unknownLabel =
    isRu ? 'Не указано' : isEn ? 'Not specified' : 'არ არის მითითებული';
  const parcelsCountLabel = isRu ? 'посылок' : isEn ? 'parcels' : 'ამანათი';

  const groups = useMemo(() => {
    if (countsByOrigin && Object.keys(countsByOrigin).length > 0) {
      const keys = sortCountryKeys(Object.keys(countsByOrigin));
      return keys
        .filter((key) => (countsByOrigin[key] ?? 0) > 0)
        .map((key) => ({
          key,
          count: countsByOrigin[key] ?? 0,
        }));
    }
    const map = new Map<string, number>();
    for (const p of parcels) {
      const k = parcelOriginKey(p.originCountry);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return sortCountryKeys([...map.keys()]).map((key) => ({
      key,
      count: map.get(key)!,
    }));
  }, [countsByOrigin, parcels]);

  const totalInHub =
    countsByOrigin && Object.keys(countsByOrigin).length > 0
      ? Object.values(countsByOrigin).reduce((a, b) => a + b, 0)
      : parcels.length;

  if (totalInHub === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-[16px] text-gray-600">
        {noParcels}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {groups.map(({ key, count }) => {
        const flagKey = key === UNKNOWN_COUNTRY_KEY ? null : CODE_TO_FLAG[key];
        const Flag = flagKey ? FLAGS[flagKey] : null;
        const label =
          key === UNKNOWN_COUNTRY_KEY
            ? unknownLabel
            : Object.prototype.hasOwnProperty.call(CODE_TO_FLAG, key)
              ? tParcels(parcelOriginLabelKey(key))
              : key.toUpperCase();

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectCountry(key)}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
            aria-label={label}
          >
            <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-gray-50 shadow-inner">
              {Flag ? (
                <Flag
                  title={label}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : (
                <span className="text-[22px] font-semibold text-gray-400">?</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight text-black">{label}</p>
              <p className="mt-1 text-[13px] text-gray-600">
                {count} {parcelsCountLabel}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
