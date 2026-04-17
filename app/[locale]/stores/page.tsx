import React from 'react';
import type { Metadata } from 'next';
import { getPageSeoMetadata } from '@/lib/seo';
import StoresClient from './StoresClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/stores');
}

export default function StoresPage() {
  return <StoresClient />;
}
