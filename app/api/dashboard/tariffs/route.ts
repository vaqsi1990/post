import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { convertToGel, fetchNbgRates } from '@/lib/nbgRates';

export const dynamic = 'force-dynamic';

/** Form country codes (uk, us, ...) to DB tariff originCountry (GB, US, ...) */
const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
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

/**
 * ვალუტა `originCountry`-ზე განისაზღვრება, რათა DB-ში არათანმიმდევრული `currency` არ გვატკინოს.
 * ეს უნდა ემთხვეოდეს `lib/tariffLookup.ts` ლოგიკას.
 */
const CURRENCY_BY_ORIGIN_ISO: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CN: 'USD',
  IT: 'EUR',
  GR: 'EUR',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  TR: 'USD',
};

/**
 * GET - Returns pricePerKg per (form) country for logged-in dashboard user.
 * Used to show "ფასი = წონა × ტარიფი" when creating a parcel.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const nbgRates = await fetchNbgRates().catch(() => null);
    const tariffsRaw = await getCachedActiveTariffsForGeorgia();
    const tariffs = [...tariffsRaw].sort((a, b) => {
      const o = a.originCountry.localeCompare(b.originCountry);
      if (o !== 0) return o;
      return a.minWeight - b.minWeight;
    });

    const byFormCountry: Record<string, number> = {};
    for (const t of tariffs) {
      if (t.minWeight !== 0 || t.maxWeight != null) continue;
      const formCode = Object.entries(FORM_TO_TARIFF_COUNTRY).find(
        ([_, db]) => db === t.originCountry
      )?.[0];
      if (formCode == null) continue;
      const derivedCurrency =
        CURRENCY_BY_ORIGIN_ISO[t.originCountry.toUpperCase()] ??
        t.currency ??
        'GEL';
      const amountGel =
        nbgRates
          ? convertToGel(nbgRates, t.pricePerKg, derivedCurrency)
          : null;
      byFormCountry[formCode] =
        amountGel != null
          ? Math.round(amountGel * 100) / 100
          : t.pricePerKg;
    }

    return NextResponse.json(
      { tariffs: byFormCountry },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (e) {
    console.error('Get dashboard tariffs error:', e);
    return NextResponse.json(
      { error: 'შეცდომა ტარიფების წამოღებისას' },
      { status: 500 }
    );
  }
}
