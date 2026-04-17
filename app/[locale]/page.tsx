import React from 'react';
import type { Metadata } from 'next';
import Hero from '../Components/Hero';
import Tariffs from '../Components/Tariffs';
import Why from '../Components/Why';
import Works from '@/app/Components/Works';
import { getPageSeoMetadata } from '@/lib/seo';

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
        <Hero />
          <Why />
       
  
      <Works />
      <Tariffs />
      {/* <HomeMarqueeBand /> */}
      {/* <Reviews /> */}
    </div>
  );
};

export default Page;
