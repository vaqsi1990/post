import { FORM_TO_TARIFF_COUNTRY } from '@/lib/tariffLookup';

/** ფორმის კოდი → ქვეყნის მესამე პირი SMS-ში: «მიღებულია [აქ] ქვეყნის საწყობში» (მხოლოდ `in_warehouse`) */
const WAREHOUSE_FROM_PHRASE_KA: Record<string, string> = {
  uk: 'დიდი ბრიტანეთის',
  us: 'ამერიკის',
  cn: 'ჩინეთის',
  it: 'იტალიის',
  gr: 'საბერძნეთის',
  es: 'ესპანეთის',
  fr: 'საფრანგეთის',
  de: 'გერმანიის',
  tr: 'თურქეთის',
};

const ISO_TO_FORM: Record<string, string> = Object.fromEntries(
  Object.entries(FORM_TO_TARIFF_COUNTRY).map(([form, iso]) => [
    iso.toUpperCase(),
    form,
  ]),
);

/**
 * ქვეყნის ნაწილი "X ქვეყნის საწყობში" — მხოლოდ `in_warehouse` SMS-ში.
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
