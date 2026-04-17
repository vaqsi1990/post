import React from "react";
import type { Metadata } from 'next';
import ServicesAccordion from "./ServicesAccordion";
import { getPageSeoCopy, getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
};

export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { service } = await searchParams;
  const isKa = locale === "ka";
  const seo = getPageSeoCopy(locale, '/services');

  return (
    <section
      id="services"
      className="w-full pt-14 mt-14 md:mt-32 md:pt-20 pb-16 md:pb-34 "
    >
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{seo.title}</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">{seo.description}</p>
      </div>
      <ServicesAccordion isKa={isKa} activeServiceId={service} />
    </section>
  );
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/services');
}

