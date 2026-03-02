'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
} from 'country-flag-icons/react/3x2';

const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
};

const TARIFF_ROWS = [
  { countryKey: 'uk' as const, countryCode: 'GB', pricePerKg: 4.5, deliveryDaysPrefix: '5-7' },
  { countryKey: 'us' as const, countryCode: 'US', pricePerKg: 5.5, deliveryDaysPrefix: '7-10' },
  { countryKey: 'cn' as const, countryCode: 'CN', pricePerKg: 3.2, deliveryDaysPrefix: '10-14' },
  { countryKey: 'it' as const, countryCode: 'IT', pricePerKg: 4.0, deliveryDaysPrefix: '5-7' },
  { countryKey: 'gr' as const, countryCode: 'GR', pricePerKg: 3.8, deliveryDaysPrefix: '5-7' },
  { countryKey: 'es' as const, countryCode: 'ES', pricePerKg: 4.2, deliveryDaysPrefix: '5-7' },
  { countryKey: 'fr' as const, countryCode: 'FR', pricePerKg: 4.0, deliveryDaysPrefix: '5-7' },
  { countryKey: 'de' as const, countryCode: 'DE', pricePerKg: 3.9, deliveryDaysPrefix: '5-7' },
  { countryKey: 'tr' as const, countryCode: 'TR', pricePerKg: 2.8, deliveryDaysPrefix: '3-5' },
] as const;

const viewport = { once: true, amount: 0.15, margin: '-60px 0px -60px 0px' };

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

export default function Tariffs() {
  const t = useTranslations('home');
  const tAddr = useTranslations('addresses');

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: 0.6 }}
      className="w-full py-10 sm:py-14 md:py-24 bg-gradient-to-b from-slate-50 to-slate-200 relative overflow-hidden"
    >
    <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 relative z-10">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-6 sm:mb-8 md:mb-14"
      >
        <h2 className="text-slate-900 text-[20px] sm:text-[22px] md:text-[34px] font-extrabold tracking-tight">
          {t('tariffsSectionTitle')}
        </h2>
        
      </motion.div>
  
      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 56 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-lg sm:shadow-2xl"
      >
        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[280px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="text-left py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-8 text-slate-800 font-semibold text-xs sm:text-sm md:text-[18px]">
                  {t('tariffCountry')}
                </th>
                <th className="text-center py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-8 text-slate-800 font-semibold text-xs sm:text-sm md:text-[18px]">
                  {t('tariffDelivery')}
                </th>
                <th className="text-right py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-8 text-slate-800 font-semibold text-xs sm:text-sm md:text-[18px]">
                  {t('tariffPrice')}
                </th>
              </tr>
            </thead>
  
            <motion.tbody
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {TARIFF_ROWS.map((row, i) => {
                const countryName = tAddr(row.countryKey);
                const deliveryDays = `${row.deliveryDaysPrefix} ${t('tariffDeliveryDays')}`;
                return (
                  <motion.tr
                    key={row.countryCode}
                    variants={item}
                    className={`transition-colors duration-200 border-b border-slate-100 hover:bg-slate-50 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 sm:py-3 sm:px-4 md:py-4 md:px-8 text-slate-800 text-xs sm:text-sm md:text-[18px] font-medium">
                      <span className="inline-flex items-center gap-2 sm:gap-3">
                        {(() => {
                          const Flag = FLAGS[row.countryCode];
                          return Flag ? (
                            <Flag
                              title={countryName}
                              className="w-6 h-4 sm:w-7 sm:h-5 md:w-8 md:h-6 rounded object-cover shrink-0 shadow-sm"
                            />
                          ) : null;
                        })()}
                        <span className="whitespace-nowrap">{countryName}</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 sm:py-3 sm:px-4 md:py-4 md:px-8 text-center text-slate-700 text-xs sm:text-sm md:text-[18px]">
                      {deliveryDays}
                    </td>

                    <td className="py-2.5 px-3 sm:py-3 sm:px-4 md:py-4 md:px-8 text-right text-slate-900 text-xs sm:text-sm md:text-[18px] font-semibold whitespace-nowrap">
                      $ {row.pricePerKg.toFixed(2)}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  </motion.section>
  );
}
