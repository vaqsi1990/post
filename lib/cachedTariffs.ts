import { revalidateTag, unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import type { TariffPick } from '@/lib/tariffLookup';

export const ACTIVE_TARIFFS_CACHE_TAG = 'tariffs-active-ge';

/**
 * აქტიური ტარიფები GE-ისთვის — იგივე select ყველგან, რათა ერთი ქეში გამოყენებადი იყოს.
 * ადმინის ტარიფის CRUD-ის შემდეგ იძახება `revalidateActiveTariffsCache()`.
 */
export const getCachedActiveTariffsForGeorgia = unstable_cache(
  async (): Promise<TariffPick[]> => {
    const rows = await prisma.tariff.findMany({
      where: { isActive: true, destinationCountry: 'GE' },
      select: {
        originCountry: true,
        destinationCountry: true,
        minWeight: true,
        maxWeight: true,
        pricePerKg: true,
        currency: true,
        isActive: true,
      },
    });
    return rows as TariffPick[];
  },
  ['active-tariffs-ge-v1'],
  { revalidate: 120, tags: [ACTIVE_TARIFFS_CACHE_TAG] },
);

export function revalidateActiveTariffsCache() {
  revalidateTag(ACTIVE_TARIFFS_CACHE_TAG, 'max');
}
