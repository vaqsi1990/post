import { cacheAside, makeDeterministicCacheKey } from '@/lib/cache/redisCache';

export const DashboardCacheTags = {
  tariffs: 'dash:tariffs',
} as const;

export function dashUserTag(userId: string) {
  return `dash:user:${userId}`;
}

export function dashUserParcelsTag(userId: string) {
  return `dash:user:${userId}:parcels`;
}

export function dashUserParcelsStatusTag(userId: string, status: string) {
  return `dash:user:${userId}:parcels:status:${status}`;
}

export function dashUserParcelIdTag(userId: string, id: string) {
  return `dash:user:${userId}:parcel:${id}`;
}

export function dashUserOrdersTag(userId: string) {
  return `dash:user:${userId}:orders`;
}

export function dashUserBalanceTag(userId: string) {
  return `dash:user:${userId}:balance`;
}

export function dashUserProfileTag(userId: string) {
  return `dash:user:${userId}:profile`;
}

export function dashUserAddressesTag(userId: string) {
  return `dash:user:${userId}:addresses`;
}

export function dashUserTrackingTag(userId: string, code: string) {
  return `dash:user:${userId}:tracking:${code.toLowerCase()}`;
}

type DashboardCacheOptions = {
  ttlSeconds?: number;
  tags?: string[];
};

/**
 * Cache-aside wrapper for dashboard reads (user-specific).
 * TTL defaults to 60s; stampede-protected via redisCache.ts.
 */
export async function cachedDashboard<T>(
  id: string,
  params: unknown,
  fetcher: () => Promise<T>,
  opts: DashboardCacheOptions = {},
): Promise<T> {
  const cacheKey = makeDeterministicCacheKey(`dash:${id}`, params);
  return await cacheAside(cacheKey, fetcher, {
    ttlSeconds: opts.ttlSeconds ?? 60,
    tags: opts.tags ?? [],
  });
}

