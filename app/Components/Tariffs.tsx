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

type DeliveryNoteKey = 'tariffAirShipping' | 'tariffLandShipping';

type TariffRow = {
  countryKey: string;
  countryCode: string;
  pricePerKg: number;
  deliveryDaysPrefix: string;
  currencySymbol: string;
  deliveryNoteKey?: DeliveryNoteKey;
};

const TARIFF_ROWS: TariffRow[] = [
  {
    countryKey: 'unitedkingdom' as const,
    countryCode: 'GB',
    pricePerKg: 7,
    deliveryDaysPrefix: '3-7',
    currencySymbol: '£',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'usa' as const,
    countryCode: 'US',
    pricePerKg: 8,
    deliveryDaysPrefix: '3-7',
    currencySymbol: '$',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'china' as const,
    countryCode: 'CN',
    pricePerKg: 12,
    deliveryDaysPrefix: '5-8',
    currencySymbol: '$',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'italy' as const,
    countryCode: 'IT',
    pricePerKg: 7,
    deliveryDaysPrefix: '1-3',
    currencySymbol: '€',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'greece' as const,
    countryCode: 'GR',
    pricePerKg: 7,
    deliveryDaysPrefix: '1-3',
    currencySymbol: '€',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'spain' as const,
    countryCode: 'ES',
    pricePerKg: 7,
    deliveryDaysPrefix: '1-3',
    currencySymbol: '€',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'france' as const,
    countryCode: 'FR',
    pricePerKg: 7,
    deliveryDaysPrefix: '1-3',
    currencySymbol: '€',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'germany' as const,
    countryCode: 'DE',
    pricePerKg: 7,
    deliveryDaysPrefix: '1-3',
    currencySymbol: '€',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'turkey' as const,
    countryCode: 'TR',
    pricePerKg: 4,
    deliveryDaysPrefix: '3-6',
    currencySymbol: '$',
    deliveryNoteKey: 'tariffLandShipping',
  },
];

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
   
    
      className="relative w-full overflow-hidden bg-[#010002] py-10 sm:py-14 md:py-24"
    >
      {/* Soft top glow — same family as bg, slightly lifted */}
      <div
        className="pointer-events-none absolute inset-0 "
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-center sm:mb-8 md:mb-14"
        >
          <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[22px] md:text-[34px]">
            {t('tariffsSectionTitle')}
          </h2>
        </motion.div>

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 56 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121311] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:rounded-2xl"
        >
          <div className="-mx-px overflow-x-auto">
            <table className="w-full min-w-[280px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161716]">
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/90 sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold md:text-white/90">
                    {t('tariffCountry')}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/90 sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold md:text-white/90">
                    {t('tariffDelivery')}
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/90 sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold md:text-white/90">
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
                  const deliveryDaysLabel = t('tariffDeliveryDays').trim();
                  const deliveryDays = `${row.deliveryDaysPrefix} ${deliveryDaysLabel}`;
                  const deliveryNote = row.deliveryNoteKey ? t(row.deliveryNoteKey) : null;
                  return (
                    <motion.tr
                      key={row.countryCode}
                      variants={item}
                      className={`border-b border-white/[0.06] transition-colors duration-200 last:border-b-0 hover:bg-white/[0.03] ${
                        i % 2 === 0 ? 'bg-[#121311]' : 'bg-[#0f100f]'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-xs font-medium text-white/90 sm:px-4 sm:py-3 md:px-8 md:py-4 md:text-sm md:text-[18px]">
                        <span className="inline-flex items-center gap-2 sm:gap-3">
                          {(() => {
                            const Flag = FLAGS[row.countryCode];
                            return Flag ? (
                              <Flag
                                title={countryName}
                                className="h-4 w-6 shrink-0 rounded object-cover shadow-md ring-1 ring-white/10 sm:h-5 sm:w-7 md:h-6 md:w-8"
                              />
                            ) : null;
                          })()}
                          <span className="whitespace-nowrap">{countryName}</span>
                        </span>
                      </td>

                      <td
                        className={`px-3 py-2.5 text-center text-xs text-white/90 sm:px-4 sm:py-3 md:px-8 md:py-4 ${
                          row.deliveryNoteKey ? 'md:text-[16px]' : 'md:text-[18px]'
                        }`}
                      >
                        {row.deliveryNoteKey ? (
                          <span className="flex flex-col items-center leading-tight">
                            <span className="whitespace-nowrap text-[16px] md:text-[18px]">{deliveryDays}</span>
                            <span className="whitespace-nowrap text-[16px] md:text-[18px] text-white/90 mt-0.5">
                              {deliveryNote?.replace(/[()]/g, '')}
                            </span>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap">{deliveryDays}</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold text-white/90 tabular-nums sm:px-4 sm:py-3 md:px-8 md:py-4 md:text-sm md:text-[18px]">
                        {row.currencySymbol} {row.pricePerKg.toFixed(2)}
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
