import React from 'react';
import type { Metadata } from 'next';
import PublicShippingCalculator from '@/app/Components/PublicShippingCalculator';
import { getPageSeoCopy, getPageSeoMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/calculator');
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculator' });
  const seo = getPageSeoCopy(locale, '/calculator');
  return (
    <section
      id="calculator"
      className="w-full bg-gray-50 pt-14 mt-14 mb-16"
    >
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">{seo.description}</p>
      </div>
      <PublicShippingCalculator />
    </section>
  );
}
