'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GB from 'country-flag-icons/react/3x2/GB';
import US from 'country-flag-icons/react/3x2/US';
import CN from 'country-flag-icons/react/3x2/CN';
import IT from 'country-flag-icons/react/3x2/IT';
import GR from 'country-flag-icons/react/3x2/GR';
import ES from 'country-flag-icons/react/3x2/ES';
import FR from 'country-flag-icons/react/3x2/FR';
import DE from 'country-flag-icons/react/3x2/DE';
import TR from 'country-flag-icons/react/3x2/TR';

const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB, US, CN, IT, GR, ES, FR, DE, TR,
};

const TARIFFS = [
  { country: 'დიდი ბრიტანეთი', countryCode: 'GB', pricePerKg: 4.5, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'ამერიკა', countryCode: 'US', pricePerKg: 5.5, deliveryDays: '7-10 სამუშაო დღე' },
  { country: 'ჩინეთი', countryCode: 'CN', pricePerKg: 3.2, deliveryDays: '10-14 სამუშაო დღე' },
  { country: 'იტალია', countryCode: 'IT', pricePerKg: 4.0, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'საბერძნეთი', countryCode: 'GR', pricePerKg: 3.8, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'ესპანეთი', countryCode: 'ES', pricePerKg: 4.2, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'საფრანგეთი', countryCode: 'FR', pricePerKg: 4.0, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'გერმანია', countryCode: 'DE', pricePerKg: 3.9, deliveryDays: '5-7 სამუშაო დღე' },
  { country: 'თურქეთი', countryCode: 'TR', pricePerKg: 2.8, deliveryDays: '3-5 სამუშაო დღე' },
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
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewport}
      transition={{ duration: 0.6 }}
      className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-slate-200 relative overflow-hidden"
    >
    <div className="max-w-3xl mx-auto w-full px-4 relative z-10">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-10 md:mb-14"
      >
        <h2 className="text-slate-900 md:text-[34px] text-[22px] font-extrabold tracking-tight">
          ტარიფები და ვადები
        </h2>
        
      </motion.div>
  
      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 56 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="text-left py-5 px-4 md:px-8 text-slate-800 font-semibold text-sm md:text-[18px]">
                  ქვეყანა
                </th>
                <th className="text-center py-5 px-4 md:px-8 text-slate-800 font-semibold text-sm md:text-[18px]">
                  ვადა
                </th>
                <th className="text-right py-5 px-4 md:px-8 text-slate-800 font-semibold text-sm md:text-[18px]">
                  ფასი
                </th>
              </tr>
            </thead>
  
            <motion.tbody
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
            >
              {TARIFFS.map((row, i) => (
                <motion.tr
                  key={row.country}
                  variants={item}
                  className={`transition-colors duration-200 border-b border-slate-100 hover:bg-slate-50 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  <td className="py-4 px-4 md:px-8 text-slate-800 text-sm md:text-[18px] font-medium">
                    <span className="inline-flex items-center gap-3">
                      {(() => {
                        const Flag = FLAGS[row.countryCode];
                        return Flag ? (
                          <Flag
                            title={row.country}
                            className="w-7 h-5 md:w-8 md:h-6 rounded object-cover shrink-0 shadow-sm"
                          />
                        ) : null;
                      })()}
                      {row.country}
                    </span>
                  </td>
  
                  <td className="py-4 px-4 md:px-8 text-center text-slate-700 text-sm md:text-[18px]">
                    {row.deliveryDays}
                  </td>
  
                  <td className="py-4 px-4 md:px-8 text-right text-slate-900 text-sm md:text-[18px] font-semibold">
                    $ {row.pricePerKg.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  </motion.section>
  );
}
