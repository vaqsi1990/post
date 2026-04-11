/** იგივე ლოგიკა, რაც ადმინის ქვეყნის ჰაბზე — DB-ში originCountry-ის ნორმალიზება ქვე-kლასად. */

export const UNKNOWN_COUNTRY_KEY = '__unknown__';

export function parcelOriginKey(
  originCountry: string | null | undefined,
): string {
  if (originCountry == null || String(originCountry).trim() === '') {
    return UNKNOWN_COUNTRY_KEY;
  }
  return String(originCountry).trim().toLowerCase();
}
