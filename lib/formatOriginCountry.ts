/** Parcel.originCountry ინახება ფორმის კოდით (us, uk, …) ან ISO-სტილით (US, …) */
const LABEL_BY_CODE: Record<string, string> = {
  us: 'America',
};

export function formatOriginCountryLabel(
  value: string | null | undefined,
): string {
  if (value == null || String(value).trim() === '') return '—';
  const key = String(value).trim().toLowerCase();
  return LABEL_BY_CODE[key] ?? String(value).trim();
}
