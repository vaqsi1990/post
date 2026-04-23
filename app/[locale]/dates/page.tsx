import React from "react";
import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { getPageSeoMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getFlightDisplayName } from '@/lib/datesFlightNames';
import { unstable_cache } from 'next/cache';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = getPageSeoMetadata(locale, '/dates');
  const { upcomingCount, nextUpcoming } = await getDatesFlightsSummary();

  const nextDateLabel =
    nextUpcoming?.departureAt != null
      ? new Intl.DateTimeFormat(getDateTimeLocale(locale), {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(nextUpcoming.departureAt)
      : null;

  const titleSuffix =
    nextDateLabel != null
      ? ` — ${nextDateLabel}`
      : upcomingCount > 0
        ? ` — ${upcomingCount}`
        : '';

  const descriptionSuffix =
    nextDateLabel != null
      ? ` Next departure: ${nextDateLabel}.`
      : upcomingCount > 0
        ? ` Upcoming flights: ${upcomingCount}.`
        : '';

  return {
    ...base,
    title:
      typeof base.title === 'string'
        ? `${base.title}${titleSuffix}`
        : base.title,
    description: `${base.description ?? ''}${descriptionSuffix}`.trim(),
  };
}

const countryNameByLocale: Record<string, Record<string, string>> = {
  ka: {
    GE: "საქართველო",
    GB: "ბრიტანეთი",
    US: "აშშ",
    CN: "ჩინეთი",
    GR: "საბერძნეთი",
    FR: "საფრანგეთი",
    TR: "თურქეთი",
  },
  en: {
    GE: "Georgia",
    GB: "United Kingdom",
    US: "USA",
    CN: "China",
    GR: "Greece",
    FR: "France",
    TR: "Turkey",
  },
  ru: {
    GE: "Грузия",
    GB: "Великобритания",
    US: "США",
    CN: "Китай",
    GR: "Греция",
    FR: "Франция",
    TR: "Турция",
  },
};

const statusStyle: Record<string, string> = {
  open: " text-black ",
  closed: " text-black ",
};

const statusIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  open: CheckCircle2,
  closed: XCircle,
};

function getDateTimeLocale(locale: string) {
  if (locale === 'ru') return 'ru-RU';
  if (locale === 'en') return 'en-US';
  return 'ka-GE';
}

function asValidDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDateTime(value: unknown, locale: string, fallback: string) {
  const date = asValidDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat(getDateTimeLocale(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toIsoOrUndefined(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }
  return undefined;
}

export const revalidate = 300;

const getDatesFlights = unstable_cache(
  async () => {
    try {
      return await prisma.reis.findMany({
        orderBy: [{ departureAt: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          originCountry: true,
          destinationCountry: true,
          departureAt: true,
          arrivalAt: true,
          status: true,
        },
      });
    } catch {
      // If DB is temporarily unavailable during prerender/ISR,
      // fail soft and render an empty list instead of breaking the build.
      return [];
    }
  },
  ['public:dates:flights:v1'],
  { revalidate: 300 },
);

const getDatesFlightsSummary = unstable_cache(
  async () => {
    try {
      const now = new Date();
      const [upcomingCount, nextUpcoming] = await Promise.all([
        prisma.reis.count({
          where: {
            status: 'open',
            departureAt: { gte: now },
          },
        }),
        prisma.reis.findFirst({
          where: {
            status: 'open',
            departureAt: { gte: now },
          },
          orderBy: [{ departureAt: 'asc' }, { createdAt: 'desc' }],
          select: { departureAt: true },
        }),
      ]);

      return { upcomingCount, nextUpcoming };
    } catch {
      return { upcomingCount: 0, nextUpcoming: null };
    }
  },
  ['public:dates:flights:summary:v1'],
  { revalidate: 300 },
);

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dates' });
  const countryName = countryNameByLocale[locale] ?? countryNameByLocale.ka;
  const routeSeparator = t('routeSeparator');
  const notSpecified = t('notSpecified');

  const flights = await getDatesFlights();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';
  const pageUrl = `${siteUrl}/${locale}/dates`;
  const eventSchema = flights
    .filter((f) => f.departureAt != null)
    .slice(0, 25)
    .map((flight) => {
      const origin = countryName[flight.originCountry] ?? flight.originCountry;
      const destination =
        countryName[flight.destinationCountry] ?? flight.destinationCountry;

      return {
        '@type': 'Event',
        name: `Postifly ${getFlightDisplayName(locale, flight.name)}`,
        startDate: toIsoOrUndefined(flight.departureAt),
        endDate: toIsoOrUndefined(flight.arrivalAt),
        eventStatus:
          flight.status === 'open'
            ? 'https://schema.org/EventScheduled'
            : 'https://schema.org/EventCancelled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: `${origin} ${routeSeparator} ${destination}`,
        },
      };
    });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: eventSchema.map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: e,
    })),
    url: pageUrl,
  };

  return (
    <main className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {t('subtitle')}
          </p>
        </div>

        {flights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {flights.map((flight) => {
              const route = `${countryName[flight.originCountry] ?? flight.originCountry} ${routeSeparator} ${
                countryName[flight.destinationCountry] ?? flight.destinationCountry
              }`;
              const flightDisplayName =
                getFlightDisplayName(locale, flight.name);

              return (
                <article
                  key={flight.id}
                  className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-all duration-200  hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="md:text-[16px] text-[14px] font-medium uppercase tracking-widest text-slate-500">
                        {t('flightLabel')}
                      </p>
                      <h2 className="mt-1 md:text-[18px] text-[16px] font-semibold text-slate-900 ">
                        {flightDisplayName}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex px-3 py-1 text-[18px] font-semibold  ${
                        statusStyle[flight.status] ?? " text-black "
                      }`}
                    >
                      {(() => {
                        const Icon = statusIcon[flight.status];
                        const label =
                          flight.status === 'open'
                            ? t('status.open')
                            : flight.status === 'closed'
                              ? t('status.closed')
                              : flight.status;

                        return (
                          <span className="inline-flex items-center gap-1.5" title={label}>
                            {Icon ? <Icon className="h-[26px] text-green-500 w-[26px]" aria-hidden="true" /> : null}
                            <span className="sr-only">{label}</span>
                          </span>
                        );
                      })()}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="md:text-[16px] text-[14px] text-slate-500">{t('departure')}</p>
                      <p className="mt-1 md:text-[16px] text-[14px] font-medium text-slate-800">
                        {formatDateTime(flight.departureAt, locale, notSpecified)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="md:text-[16px] text-[14px] text-slate-500">{t('arrival')}</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {formatDateTime(flight.arrivalAt, locale, notSpecified)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="md:text-[16px] text-[14px] text-slate-500">{t('direction')}</p>
                      <p className="mt-1 font-medium text-slate-800">{route}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}