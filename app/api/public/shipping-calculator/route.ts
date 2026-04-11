import { NextResponse } from 'next/server';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import type { TariffPick } from '@/lib/tariffLookup';

export const dynamic = 'force-dynamic';

/**
 * საჯარო ტარიფის შეფასება: DB ტარიფი × NBG კურსი × წონა → ლარი (იგივე რაც პარცელებზე).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const originCountry = url.searchParams.get('originCountry')?.trim() ?? '';
  const weightRaw = url.searchParams.get('weight');
  const weight = weightRaw == null ? NaN : Number.parseFloat(weightRaw.replace(',', '.'));

  if (!originCountry) {
    return NextResponse.json({ error: 'originCountry required' }, { status: 400 });
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    return NextResponse.json({ error: 'weight must be a positive number' }, { status: 400 });
  }

  try {
    const [tariffs, nbgRates] = await Promise.all([
      getCachedActiveTariffsForGeorgia(),
      fetchNbgRates().catch(() => null),
    ]);

    const picks: TariffPick[] = tariffs.map((t) => ({
      originCountry: t.originCountry,
      destinationCountry: t.destinationCountry,
      minWeight: t.minWeight,
      maxWeight: t.maxWeight,
      pricePerKg: t.pricePerKg,
      currency: t.currency,
      isActive: t.isActive,
    }));

    const breakdown = computeShippingGelBreakdown(
      { originCountry, weight },
      picks,
      nbgRates,
    );

    if (!breakdown) {
      return NextResponse.json(
        {
          error: 'no_tariff',
          message: 'ტარიფი ვერ მოიძებნა ან კურსი მიუწვდომელია',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        amountGel: breakdown.amountGel,
        pricePerKgGel: breakdown.pricePerKgGel,
        formula: breakdown.formula,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      },
    );
  } catch (e) {
    console.error('shipping-calculator GET:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
