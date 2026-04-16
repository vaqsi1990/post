import React from "react";
import type { Metadata } from 'next';
import ConditionsAccordion from "./ConditionsAccordion";
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string }>;
};

export default async function ConditionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { section } = await searchParams;

  return (
    <div className="w-full pt-10 mt-14 mb-16 ">
      <section
        id="conditions"
        className="w-full "
      >
        <ConditionsAccordion locale={locale} sectionId={section} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/conditions');
}
