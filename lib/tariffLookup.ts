/** იგივე რუკა, რაც `app/api/dashboard/parcels/route.ts`-ში — ფორმის კოდი → ტარიფის originCountry */
export const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  gr: 'GR',
  fr: 'FR',
  tr: 'TR',
};

/**
 * ვალუტა `originCountry`-ზე უნდა განისაზღვროს (ქვეყნის მიხედვით),
 * რადგან DB-ში `currency` ველი ხშირად არ არის თანმიმდევრული.
 */
/** ტარიფის origin ISO → ISO ვალუტის კოდი (NBG კურსისთვის). */
export const CURRENCY_BY_ORIGIN_ISO: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CN: 'USD',
  GR: 'EUR',
  FR: 'EUR',
  TR: 'USD',
};

export type TariffPick = {
  originCountry: string;
  destinationCountry: string;
  minWeight: number;
  maxWeight: number | null;
  pricePerKg: number;
  currency: string;
  isActive: boolean;
};

/**
 * იგივე წესი, რაც ამანათის შექმნისას: აქტიური ტარიფი GE-მდე, წონის ინტერვალი, ყველაზე მაღალი minWeight.
 */
export function resolveTariffForParcel(
  tariffs: TariffPick[],
  originCountry: string | null,
  weightKg: number | null,
): { pricePerKg: number; shippingTotal: number; currency: string } | null {
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
  const derivedCurrency = CURRENCY_BY_ORIGIN_ISO[tariffCountry];
  return {
    pricePerKg: tariff.pricePerKg,
    shippingTotal,
    currency: derivedCurrency ?? tariff.currency ?? 'GEL',
  };
}

/** დეშბორდზე ჩვენებისთვის: უნიკალური origin-ები, 1 კგ-ზე გადაწყვეტილი ტარიფი, ცნობილი ქვეყნების ფიქსირებული რიგითობა. */
const DASHBOARD_TARIFF_ORIGIN_ORDER = [
  'GB',
  'US',
  'CN',
  'GR',
  'FR',
  'TR',
] as const;

/** Dashboard-ზე არ ვაჩვენებთ ამ origin ISO-ებს (მიუხედავად იმისა, რომ DB-ში შეიძლება არსებობდეს). */
const DASHBOARD_TARIFF_ORIGIN_BLOCKLIST = new Set(['DE', 'ES', 'IT']);

export function formKeyForTariffIso(iso: string): string | null {
  const u = iso.toUpperCase();
  for (const [key, code] of Object.entries(FORM_TO_TARIFF_COUNTRY)) {
    if (code === u) return key;
  }
  return null;
}

export function buildDashboardTariffRows(tariffs: TariffPick[]) {
  const origins = [
    ...new Set(tariffs.map((t) => t.originCountry.toUpperCase())),
  ].filter((iso) => !DASHBOARD_TARIFF_ORIGIN_BLOCKLIST.has(iso));
  const preferred = DASHBOARD_TARIFF_ORIGIN_ORDER as readonly string[];
  const ordered = [
    ...preferred.filter((iso) => origins.includes(iso)),
    ...origins.filter((iso) => !preferred.includes(iso)).sort(),
  ];
  const rows: {
    originIso: string;
    pricePerKg: number;
    currency: string;
  }[] = [];
  for (const iso of ordered) {
    const resolved = resolveTariffForParcel(tariffs, iso, 1);
    if (resolved) {
      rows.push({
        originIso: iso,
        pricePerKg: resolved.pricePerKg,
        currency: resolved.currency,
      });
    }
  }
  return rows;
}
