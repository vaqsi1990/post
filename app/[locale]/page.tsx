import React from 'react';
import type { Metadata } from 'next';
import Hero from '../Components/Hero';
import Tariffs from '../Components/Tariffs';
import Why from '../Components/Why';
import Works from '@/app/Components/Works';
import { getPageSeoMetadata } from '@/lib/seo';

// Make the marketing homepage CDN-cacheable (ISR) to reduce SSR load and cold-start impact.
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/');
}

const Page = () => {
  return (
    <div>
      <div className="relative md:pb-28">
        <Hero />
        <Why />
      </div>
       
  
      <Works />
      <Tariffs />

      {/* <Reviews /> */}
    </div>
  );
};

export default Page;
