import React from "react";
import type { Metadata } from 'next';
import ConditionsAccordion from "./ConditionsAccordion";
import { getPageSeoCopy, getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string }>;
};

export default async function ConditionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { section } = await searchParams;
  const seo = getPageSeoCopy(locale, '/conditions');

  return (
    <div className="w-full pt-10 mt-14 mb-16 ">
      <section
        id="conditions"
        className="w-full "
      >
        <div className="mx-auto w-full max-w-5xl px-4 pb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{seo.title}</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">{seo.description}</p>
        </div>
        <ConditionsAccordion locale={locale} sectionId={section} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/conditions');
}
