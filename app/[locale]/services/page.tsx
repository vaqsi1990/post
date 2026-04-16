import React from "react";
import type { Metadata } from 'next';
import ServicesAccordion from "./ServicesAccordion";
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
};

export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { service } = await searchParams;
  const isKa = locale === "ka";

  return (
    <section
      id="services"
      className="w-full pt-14 mt-14 md:mt-32 md:pt-20 pb-16 md:pb-34 "
    >
      <ServicesAccordion isKa={isKa} activeServiceId={service} />
    </section>
  );
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/services');
}

