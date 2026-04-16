import React from "react";
import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/dates');
}

const countryName: Record<string, string> = {
  GE: "საქართველო",
  GB: "ბრიტანეთი",
  US: "აშშ",
  CN: "ჩინეთი",
  IT: "იტალია",
  GR: "საბერძნეთი",
  ES: "ესპანეთი",
  FR: "საფრანგეთი",
  DE: "გერმანია",
  TR: "თურქეთი",
};

const statusStyle: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusLabel: Record<string, string> = {
  open: "აქტიური",
  closed: "დახურული",
};

function formatDateTime(date: Date | null) {
  if (!date) return "არ არის მითითებული";
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function Page() {
  const flights = await prisma.reis.findMany({
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

  return (
    <main className="min-h-screen mt-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            უახლოესი რეისები
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            აირჩიე სასურველი რეისი და გადაამოწმე თარიღები მარტივად.
          </p>
        </div>

        {flights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            რეისები ჯერ არ არის დამატებული.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {flights.map((flight) => {
              const route = `${countryName[flight.originCountry] ?? flight.originCountry} -> ${
                countryName[flight.destinationCountry] ?? flight.destinationCountry
              }`;

              return (
                <article
                  key={flight.id}
                  className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                        რეისი
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
                        {flight.name}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        statusStyle[flight.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {statusLabel[flight.status] ?? flight.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">გაფრენა</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {formatDateTime(flight.departureAt)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">ჩამოსვლა</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {formatDateTime(flight.arrivalAt)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">მიმართულება</p>
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