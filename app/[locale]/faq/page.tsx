import React from "react";
import type { Metadata } from 'next';
import FaqAccordion from "./FaqAccordion";
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4">
        <FaqAccordion locale={locale} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/faq');
}

