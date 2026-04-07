import {
  convertToGel,
  gelPer1Unit,
  type NbgCurrencyRate,
} from '@/lib/nbgRates';
import { resolveTariffForParcel, type TariffPick } from '@/lib/tariffLookup';

/**
 * მიტანის თანხა GEL-ში: (წონა × ტარიფი უცხოურ ვალუტაში) → NBG ოფიციალური კურსით.
 * null თუ აკლია წონა/ქვეყანა, ტარიფი ან NBG.
 */
export function computeShippingAmountGel(
  parcel: { originCountry: string | null; weight: number | null },
  tariffs: TariffPick[],
  nbgRates: Map<string, NbgCurrencyRate> | null,
): number | null {
  if (!nbgRates) return null;
  const resolved = resolveTariffForParcel(
    tariffs,
    parcel.originCountry,
    parcel.weight,
  );
  if (!resolved) return null;
  const gel = convertToGel(nbgRates, resolved.shippingTotal, resolved.currency);
  if (gel == null) return null;
  return Math.round(gel * 100) / 100;
}

export type ShippingGelBreakdown = {
  amountGel: number;
  formula: string;
};

/**
 * აბრუნებს GEL თანხას და ტექსტურ ფორმულას UI-სთვის:
 * (weight kg × pricePerKg CUR/kg × rate GEL/CUR).
 */
export function computeShippingGelBreakdown(
  parcel: { originCountry: string | null; weight: number | null },
  tariffs: TariffPick[],
  nbgRates: Map<string, NbgCurrencyRate> | null,
): ShippingGelBreakdown | null {
  if (!nbgRates) return null;
  if (parcel.weight == null || parcel.weight <= 0) return null;
  const resolved = resolveTariffForParcel(
    tariffs,
    parcel.originCountry,
    parcel.weight,
  );
  if (!resolved) return null;
  const rate = gelPer1Unit(nbgRates, resolved.currency);
  if (rate == null) return null;

  const gel = convertToGel(nbgRates, resolved.shippingTotal, resolved.currency);
  if (gel == null) return null;
  const amountGel = Math.round(gel * 100) / 100;

  const w = parcel.weight;
  const pricePerKg = resolved.pricePerKg;
  const cur = resolved.currency.toUpperCase();
  const formula = `${w.toFixed(3)} kg × ${pricePerKg.toFixed(2)} ${cur}/kg × ${rate.toFixed(4)} GEL/${cur}`;
  return { amountGel, formula };
}
