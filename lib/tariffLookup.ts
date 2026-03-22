/** იგივე რუკა, რაც `app/api/dashboard/parcels/route.ts`-ში — ფორმის კოდი → ტარიფის originCountry */
export const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  it: 'IT',
  gr: 'GR',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  tr: 'TR',
};

export type TariffPick = {
  originCountry: string;
  destinationCountry: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerKg: number;
  isActive: boolean;
};

/**
 * იგივე წესი, რაც ამანათის შექმნისას: აქტიური ტარიფი GE-მდე, წონის ინტერვალი, ყველაზე მაღალი minWeight.
 */
export function resolveTariffForParcel(
  tariffs: TariffPick[],
  originCountry: string | null,
  weightKg: number | null,
): { pricePerKg: number; shippingTotal: number } | null {
  if (originCountry == null || weightKg == null || weightKg <= 0) return null;
  const trimmed = originCountry.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const tariffCountry =
    FORM_TO_TARIFF_COUNTRY[lower] ?? trimmed.toUpperCase();

  const candidates = tariffs.filter(
    (t) =>
      t.isActive &&
      t.destinationCountry === 'GE' &&
      t.originCountry === tariffCountry &&
      t.minWeight <= weightKg &&
      (t.maxWeight == null || t.maxWeight >= weightKg),
  );
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.minWeight - a.minWeight);
  const tariff = candidates[0]!;
  const shippingTotal =
    Math.round(weightKg * tariff.pricePerKg * 100) / 100;
  return { pricePerKg: tariff.pricePerKg, shippingTotal };
}
