import React from 'react';
import type { Metadata } from 'next';
import PublicShippingCalculator from '@/app/Components/PublicShippingCalculator';
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/calculator');
}

export default function CalculatorPage() {
  return (
    <section
      id="calculator"
      className="w-full pt-14 mt-14 mb-16"
    >
      <PublicShippingCalculator />
    </section>
  );
}
