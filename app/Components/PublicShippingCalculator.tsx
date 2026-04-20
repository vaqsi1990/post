'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

/** საერთაშორისო საკურიერო პრაქტიკა: სმ³ → კგ (ჩვეულებრივ 5000 ან 6000) */
const CM3_PER_KG_VOLUMETRIC = 6000;

function parseDecimal(s: string): number {
  const n = parseFloat(s.replace(',', '.').trim());
  return Number.isFinite(n) ? n : NaN;
}

function roundKg(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export default function PublicShippingCalculator() {
  const t = useTranslations('calculator');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{
    actual: number;
    volumetric: number;
    chargeable: number;
  } | null>(null);

  const handleCalculate = useCallback(() => {
    const L = parseDecimal(length);
    const W = parseDecimal(width);
    const H = parseDecimal(height);
    const actual = parseDecimal(weight);

    if (
      [L, W, H, actual].some((x) => Number.isNaN(x)) ||
      L <= 0 ||
      W <= 0 ||
      H <= 0 ||
      actual < 0
    ) {
      setResult(null);
      return;
    }

    const volumetric = (L * W * H) / CM3_PER_KG_VOLUMETRIC;
    const chargeable = Math.max(actual, volumetric);

    setResult({
      actual: roundKg(actual),
      volumetric: roundKg(volumetric),
      chargeable: roundKg(chargeable),
    });
  }, [length, width, height, weight]);

  const fmt = (n: number | null) =>
    n == null
      ? '0'
      : n.toLocaleString(undefined, { maximumFractionDigits: 3 });

  return (
    <div className="mx-auto w-full max-w-2xl px-1">
      

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md md:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 md:text-[16px] text-[14px] font-medium text-gray-800">
            <span>{t('length')}</span>
            <input
              type="text"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black shadow-sm focus:border-[#3a5bff] focus:outline-none focus:ring-2 focus:ring-[#3a5bff]/25"
            />
          </label>
          <label className="flex flex-col gap-1.5 md:text-[16px] text-[14px] font-medium text-gray-800">
            <span>{t('width')}</span>
            <input
              type="text"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black shadow-sm focus:border-[#3a5bff] focus:outline-none focus:ring-2 focus:ring-[#3a5bff]/25"
            />
          </label>
          <label className="flex flex-col gap-1.5 md:text-[16px] text-[14px] font-medium text-gray-800">
            <span>{t('height')}</span>
            <input
              type="text"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black shadow-sm focus:border-[#3a5bff] focus:outline-none focus:ring-2 focus:ring-[#3a5bff]/25"
            />
          </label>
        </div>

        <div className="mt-4 max-w-full sm:max-w-xs">
          <label className="flex flex-col gap-1.5 md:text-[16px] text-[14px] font-medium text-gray-800">
            <span>{t('weight')}</span>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-black shadow-sm focus:border-[#3a5bff] focus:outline-none focus:ring-2 focus:ring-[#3a5bff]/25"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={handleCalculate}
            className="rounded-lg bg-blue-500 px-8 py-3 text-[14px] md:text-[16px] font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('calculate')}
          </button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[280px] border-collapse text-center text-[14px] md:text-[15px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-3 font-semibold text-gray-800 md:px-4">
                  {t('colWeight')}
                </th>
                <th className="px-3 py-3 font-semibold text-gray-800 md:px-4">
                  {t('colVolumetric')}
                </th>
                <th className="px-3 py-3 font-semibold text-red-600 md:px-4">
                  {t('colChargeable')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-gray-100 px-3 py-4 font-medium text-gray-900 md:px-4">
                  {fmt(result?.actual ?? null)}
                </td>
                <td className="border-r border-gray-100 px-3 py-4 font-medium text-gray-900 md:px-4">
                  {fmt(result?.volumetric ?? null)}
                </td>
                <td className="px-3 py-4 text-lg font-bold text-red-600 md:px-4 md:text-xl">
                  {fmt(result?.chargeable ?? null)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
