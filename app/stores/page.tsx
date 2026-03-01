'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Store = {
  name: string;
  url: string;
};

const stores: Store[] = [
  { name: 'Amazon', url: 'https://www.amazon.com' },
  { name: 'ALDI', url: 'https://www.aldi.co.uk' },
  { name: 'Anthropologie', url: 'https://www.anthropologie.com' },
  { name: 'Argos', url: 'https://www.argos.co.uk' },
  { name: 'ASDA', url: 'https://www.asda.com' },
  { name: 'Brand Alley', url: 'https://www.brandalley.co.uk' },
  { name: 'Camerich', url: 'https://www.camerich.com' },
  { name: 'Debenhams', url: 'https://www.debenhams.com' },
  { name: 'DFS', url: 'https://www.dfs.co.uk' },
  { name: 'Dreams', url: 'https://www.dreams.co.uk' },
  { name: 'Dwell', url: 'https://www.dwell.co.uk' },
  { name: 'eBay', url: 'https://www.ebay.com' },
  { name: 'GoGroopie', url: 'https://www.gogroopie.com' },
  { name: 'Habitat', url: 'https://www.habitat.co.uk' },
  { name: 'Homebase', url: 'https://www.homebase.co.uk' },
  { name: 'House Of Fraser', url: 'https://www.houseoffraser.co.uk' },
  { name: 'IKEA', url: 'https://www.ikea.com' },
  { name: 'John Lewis', url: 'https://www.johnlewis.com' },
  { name: 'Marks And Spencer', url: 'https://www.marksandspencer.com' },
  { name: 'The White Company', url: 'https://www.thewhitecompany.com' },
  { name: 'UO', url: 'https://www.urbanoutfitters.com' },
  { name: 'Very', url: 'https://www.very.co.uk' },
  { name: 'Wayfair', url: 'https://www.wayfair.com' },
  { name: 'Sephora', url: 'https://www.sephora.com/' },
];

function storeLogoUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return '';
  }
}

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center text-black md:text-[32px] text-[22px] font-bold mb-10 md:mb-14"
          >
            ონლაინ მაღაზიები
          </motion.h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
              >
                <Link
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 relative mb-3 flex items-center justify-center">
                    <img
                      src={storeLogoUrl(store.url)}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      style={{ opacity: 1 }}
                    />
                  </div>
                  <span className="text-black font-medium text-[14px] md:text-[15px] text-center">
                    {store.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
