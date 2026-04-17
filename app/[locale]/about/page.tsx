import React from 'react';
import type { Metadata } from 'next';
import { getPageSeoMetadata } from '@/lib/seo';
import AboutClient from './AboutClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/about');
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  return <AboutClient locale={locale} />;
}

