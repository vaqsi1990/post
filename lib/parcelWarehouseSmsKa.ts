import { FORM_TO_TARIFF_COUNTRY } from '@/lib/tariffLookup';

/** ფორმის კოდი (uk, us, …) → ქართული ფრაზა «რომელი ქვეყნის საწყობიდან» (SMS-ისთვის) */
const WAREHOUSE_FROM_PHRASE_KA: Record<string, string> = {
  uk: 'დიდი ბრიტანეთიდან',
  us: 'ამერიკიდან',
  cn: 'ჩინეთიდან',
  it: 'იტალიიდან',
  gr: 'საბერძნეთიდან',
  es: 'ესპანეთიდან',
  fr: 'საფრანგეთიდან',
  de: 'გერმანიიდან',
  tr: 'თურქეთიდან',
};

const ISO_TO_FORM: Record<string, string> = Object.fromEntries(
  Object.entries(FORM_TO_TARIFF_COUNTRY).map(([form, iso]) => [
    iso.toUpperCase(),
    form,
  ]),
);

/**
 * SMS ტექსტისთვის: საიდან არის ამანათი (საერთაშორისო საწყობი ქვეყნის მიხედვით).
 * null თუ ქვეყანა ცარიელია ან უცნობი კოდია.
 */
export function warehouseFromPhraseKa(
  originCountry: string | null | undefined,
): string | null {
  if (originCountry == null) return null;
  const raw = String(originCountry).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const direct = WAREHOUSE_FROM_PHRASE_KA[lower];
  if (direct) return direct;
  const iso = raw.toUpperCase();
  const form = ISO_TO_FORM[iso];
  if (form && WAREHOUSE_FROM_PHRASE_KA[form]) {
    return WAREHOUSE_FROM_PHRASE_KA[form];
  }
  return null;
}
