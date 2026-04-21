import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import type { TariffPick } from '@/lib/tariffLookup';
import { cacheAside, invalidateCacheTags, makeDeterministicCacheKey } from '@/lib/cache/redisCache';
import { DashboardCacheTags } from '@/lib/cache/dashboardCache';

export const ACTIVE_TARIFFS_CACHE_TAG = 'tariffs-active-ge';

/**
 * აქტიური ტარიფები GE-ისთვის — იგივე select ყველგან, რათა ერთი ქეში გამოყენებადი იყოს.
 * ადმინის ტარიფის CRUD-ის შემდეგ იძახება `revalidateActiveTariffsCache()`.
 */
export async function getCachedActiveTariffsForGeorgia(): Promise<TariffPick[]> {
  const queryId = 'prisma.tariff.findMany:active:dest=GE:select=v1';
  const params = {
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
  };

  const cacheKey = makeDeterministicCacheKey(queryId, params);

  return await cacheAside(
    cacheKey,
    async () => {
      const rows = await prisma.tariff.findMany(params);
      return rows as TariffPick[];
    },
    // Tariffs change rarely and we explicitly invalidate on admin CRUD.
    // Longer TTL reduces DB cold-start + refresh stampedes under load.
    { ttlSeconds: 3600, staleSeconds: 3600, tags: [ACTIVE_TARIFFS_CACHE_TAG] }
  );
}

export function revalidateActiveTariffsCache() {
  revalidateTag(ACTIVE_TARIFFS_CACHE_TAG, 'max');
  // Best-effort Redis invalidation (cache-aside).
  void invalidateCacheTags([ACTIVE_TARIFFS_CACHE_TAG, DashboardCacheTags.tariffs]);
}
