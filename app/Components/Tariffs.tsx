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
    pricePerKg: 8,
    deliveryDaysPrefix: '3-7',
    currencySymbol: '£',
    deliveryNoteKey: 'tariffAirShipping',
  },
  {
    countryKey: 'usa' as const,
    countryCode: 'US',
    pricePerKg: 9,
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
    pricePerKg: 8,
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
    pricePerKg: 8,
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
const REVIEWS = [
  {
    name: 'ვალერიან მარგალიტაძე',
    rating: 5,
    text: 'ამანათები ყოველთვის დროულად მომდის და შეფუთვაც ძალიან კარგი აქვთ.',
  },
  {
    name: 'დავით ჩხარტიშვილი',
    rating: 5,
    text: 'კალკულატორი ზუსტ ფასს მაჩვენებს და სერვისიც ძალიან სწრაფია.',
  },
  {
    name: 'ნინო ჭყონია',
    rating: 4,
    text: 'მხარდაჭერის გუნდი ოპერატიულად მპასუხობს და დეტალურად მიხსნის ყველაფერს.',
  },
  {
    name: 'გიორგი გაბუნია',
    rating: 5,
    text: 'ევროპიდან გზავნილები პრობლემის გარეშე ჩამომივიდა, რეკომენდაციას ვუწევ.',
  },
  {
    name: 'ნინო დავითაძე',
    rating: 5,
    text: 'ხარისხი საუკეთესოა, უკვე რამდენჯერმე გამოვიყენე და კმაყოფილი ვარ.',
  },
]
export default function Tariffs() {
  const t = useTranslations('home');
  const tAddr = useTranslations('addresses');
  const tCalc = useTranslations('calculator');
  const [selectedCountryCode, setSelectedCountryCode] = React.useState<string>(TARIFF_ROWS[0].countryCode);
  const [weightKg, setWeightKg] = React.useState<string>('1');
  const [tariffPage, setTariffPage] = React.useState<number>(0);
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % REVIEWS.length)
    }, 4200)

    return () => window.clearInterval(timerId)
  }, [])
  const tariffChunks = React.useMemo(() => {
    const splitIndex = Math.ceil(TARIFF_ROWS.length / 2);
    return [TARIFF_ROWS.slice(0, splitIndex), TARIFF_ROWS.slice(splitIndex)];
  }, []);
  const activeTariffRows = tariffChunks[tariffPage] ?? tariffChunks[0];

  React.useEffect(() => {
    if (tariffChunks.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setTariffPage((prev) => (prev + 1) % tariffChunks.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [tariffChunks.length]);

  const selectedTariff = React.useMemo(
    () => TARIFF_ROWS.find((row) => row.countryCode === selectedCountryCode) ?? TARIFF_ROWS[0],
    [selectedCountryCode]
  );
  const parsedWeight = Number.parseFloat(weightKg);
  const effectiveWeight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 0;
  const calculatedPrice = selectedTariff.pricePerKg * effectiveWeight;
  const SelectedCountryFlag = FLAGS[selectedCountryCode];

  return (
    <motion.section
      id="tariffs"
      className="relative w-full overflow-hidden bg-white mt-10 pb-10"
    >
      {/* Soft top glow — same family as bg, slightly lifted */}
      <div
        className="pointer-events-none absolute inset-0 "
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-center sm:mb-8 md:mb-14"
        >
          <h2 className="text-[20px] font-extrabold tracking-tight text-black sm:text-[22px] md:text-[34px]">
            {t('tariffsSectionTitle')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_420px] lg:gap-6">
          {/* Table card */}
          <motion.div
            initial={{ opacity: 0, y: 56 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="overflow-hidden rounded-xl border border-pink-200/50 bg-gradient-to-br from-white via-indigo-50/40 to-pink-50/50 shadow-[0_20px_60px_-15px_rgba(58,91,255,0.18),0_8px_24px_-12px_rgba(255,79,216,0.12)] sm:rounded-2xl"
          >
            <div className="-mx-px overflow-x-auto">
              <table className="w-full min-w-[280px]">
                <thead>
                  <tr className="border-b border-indigo-100/80 bg-gradient-to-r from-indigo-100/90 via-white to-pink-100/80">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#3a5bff] sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold ">
                      {t('tariffCountry')}
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#3a5bff] sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold ">
                      {t('tariffDelivery')}
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#3a5bff] sm:px-4 sm:py-4 md:px-8 md:py-5 md:text-sm md:normal-case md:tracking-normal md:text-[18px] md:font-semibold ">
                      {t('tariffPrice')}
                    </th>
                  </tr>
                </thead>

                <motion.tbody
                  key={tariffPage}
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                >
                  {activeTariffRows.map((row, i) => {
                    const rowIndex = tariffPage * Math.ceil(TARIFF_ROWS.length / 2) + i;
                    const countryName = tAddr(row.countryKey);
                    const deliveryDaysLabel = t('tariffDeliveryDays').trim();
                    const deliveryDays = `${row.deliveryDaysPrefix} ${deliveryDaysLabel}`;
                    const deliveryNote = row.deliveryNoteKey ? t(row.deliveryNoteKey) : null;
                    return (
                      <motion.tr
                        key={row.countryCode}
                        variants={item}
                        className={`border-b border-indigo-100/60 transition-colors duration-200 last:border-b-0 hover:bg-indigo-50/70 ${rowIndex % 2 === 0 ? 'bg-white/80' : 'bg-indigo-50/35'
                          }`}
                      >
                        <td className="px-3 py-2.5 text-xs font-medium text-gray-800 sm:px-4 sm:py-3 md:px-8 md:py-4 md:text-sm md:text-[18px]">
                          <span className="inline-flex items-center gap-2 sm:gap-3">
                            {(() => {
                              const Flag = FLAGS[row.countryCode];
                              return Flag ? (
                                <Flag
                                  title={countryName}
                                  className="h-4 w-6 shrink-0 rounded object-cover shadow-sm ring-1 ring-gray-200/80 sm:h-5 sm:w-7 md:h-6 md:w-8"
                                />
                              ) : null;
                            })()}
                            <span className="whitespace-nowrap">{countryName}</span>
                          </span>
                        </td>

                        <td
                          className={`px-3 py-2.5 text-center text-xs text-gray-700 sm:px-4 sm:py-3 md:px-8 md:py-4 ${row.deliveryNoteKey ? 'md:text-[16px]' : 'md:text-[18px]'
                            }`}
                        >
                          {row.deliveryNoteKey ? (
                            <span className="flex flex-col items-center leading-tight">
                              <span className="whitespace-nowrap text-[16px] md:text-[18px] text-gray-800">
                                {deliveryDays}
                              </span>
                              <span className="whitespace-nowrap text-[16px] md:text-[18px] text-gray-500 mt-0.5">
                                {deliveryNote?.replace(/[()]/g, '')}
                              </span>
                            </span>
                          ) : (
                            <span className="whitespace-nowrap">{deliveryDays}</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold tabular-nums text-black sm:px-4 sm:py-3 md:px-8 md:py-4 md:text-sm md:text-[18px]">
                          {row.currencySymbol} {row.pricePerKg.toFixed(2)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>
            <div className="flex items-center justify-center border-t border-indigo-100/80 bg-white/70 px-3 py-2 sm:px-4">

              <div className="flex justify-center items-center gap-3">
                {tariffChunks.map((_, index) => (
                  <button
                    key={`tariff-page-${index}`}
                    type="button"
                    onClick={() => setTariffPage(index)}
                    className={`h-3 w-3 rounded-full transition ${tariffPage === index ? 'bg-indigo-500' : 'bg-indigo-200 hover:bg-indigo-300'
                      }`}
                    aria-label={`Go to tariff page ${index + 1}`}
                  />
                ))}
              </div>

            </div>
          </motion.div>

          <div className="flex flex-col gap-3 lg:gap-4">
            {/* Side calculator card */}
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
              className="rounded-[20px] border border-violet-200/70 bg-gradient-to-b from-[#f7f1ff] via-[#f6f3ff] to-[#f1f5ff] p-4 shadow-[0_20px_40px_-24px_rgba(130,76,255,0.7)]"
            >
            <p className="mb-2 text-sm font-semibold text-violet-700">{t('tariffCountry')}</p>
            <div className="relative">
              {SelectedCountryFlag ? (
                <SelectedCountryFlag
                  title={tAddr(selectedTariff.countryKey)}
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-6 -translate-y-1/2 rounded object-cover shadow-sm ring-1 ring-gray-200/80"
                />
              ) : null}
              <select
                value={selectedCountryCode}
                onChange={(event) => setSelectedCountryCode(event.target.value)}
                className="h-11 w-full rounded-xl border border-violet-100 bg-white pl-11 pr-3 text-[15px] font-medium text-gray-800 outline-none ring-0 focus:border-violet-300"
              >
                {TARIFF_ROWS.map((row) => (
                  <option key={row.countryCode} value={row.countryCode}>
                    {tAddr(row.countryKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid grid-cols-[2fr_auto] gap-2">
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className="h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-[20px] font-semibold text-violet-800 outline-none focus:border-violet-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label={tCalc('weight')}
              />
              <div className="h-11 rounded-xl bg-gradient-to-r from-[#8f48ff] to-[#b24dff] px-4 text-right text-[18px] font-extrabold leading-none text-white flex items-center justify-end">
                {selectedTariff.currencySymbol} {selectedTariff.pricePerKg.toFixed(0)}
              </div>
            </div>
            <div className="h-11 mt-5 rounded-xl w-full bg-gradient-to-r from-[#8f48ff] to-[#b24dff] px-4 text-right text-[18px] font-extrabold leading-none text-white flex items-center justify-end">
              {selectedTariff.currencySymbol} {calculatedPrice.toFixed(0)}
            </div>
            </motion.aside>
            <section className="w-full">
            <h2 className="mb-3 text-center text-2xl font-extrabold text-gray-900 md:text-3xl">
              მიმოხილვები
            </h2>

            <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[24px] p-2">
              <article className="min-h-[170px] rounded-2xl border border-violet-100/80 bg-white/95 p-5 shadow-[0_12px_30px_-20px_rgba(94,37,208,0.65)] sm:p-6">
                <div className="mb-3 text-xl tracking-[2px] text-amber-500">
                  {'★'.repeat(REVIEWS[activeIndex].rating)}
                </div>
                <p className="text-base leading-7 text-gray-700">"{REVIEWS[activeIndex].text}"</p>
                <p className="mt-4 text-sm font-bold text-violet-700">{REVIEWS[activeIndex].name}</p>
              </article>

              <div className="mt-5 flex items-center justify-center gap-2">
                {REVIEWS.map((review, index) => (
                  <button
                    key={review.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${activeIndex === index ? 'bg-indigo-500' : 'bg-indigo-100 hover:bg-indigo-300'
                      }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            </section>
          </div>

        </div>

      </div>
    </motion.section>
  );
}
