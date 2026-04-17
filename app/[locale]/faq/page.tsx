import React from "react";
import type { Metadata } from 'next';
import FaqAccordion from "./FaqAccordion";
import { getPageSeoCopy, getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const seo = getPageSeoCopy(locale, '/faq');

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4">
        <div className="mx-auto w-full max-w-5xl pb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{seo.title}</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">{seo.description}</p>
        </div>
        <FaqAccordion locale={locale} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/faq');
}

