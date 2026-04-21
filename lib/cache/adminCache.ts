import { makeDeterministicCacheKey } from '@/lib/cache/redisCache';
import { getRedis } from '@/lib/redis';

export const AdminCacheTags = {
  counts: 'admin:counts',
  users: 'admin:users',
  parcels: 'admin:parcels',
  orders: 'admin:orders',
  payments: 'admin:payments',
  settings: 'admin:settings',
  tariffs: 'admin:tariffs',
  reises: 'admin:reises',
  chatThreads: 'admin:chat:threads',
} as const;

export function adminOrdersTag(status?: string | null) {
  const s = (status ?? '').trim();
  return s ? `admin:orders:status:${s}` : AdminCacheTags.orders;
}

export function adminParcelsTag(status?: string | null) {
  const s = (status ?? '').trim();
  return s ? `admin:parcels:status:${s}` : AdminCacheTags.parcels;
}

type AdminCacheOptions = {
  ttlSeconds?: number;
  tags?: string[];
};

function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (typeof v === 'bigint') return v.toString();
    if (v instanceof Date) return v.toISOString();
    if (v instanceof Error) return { name: v.name, message: v.message };
    return v as unknown;
  });
}

export async function cachedAdmin<T>(
  id: string,
  params: unknown,
  fetcher: () => Promise<T>,
  opts: AdminCacheOptions = {},
): Promise<T> {
  console.log('CACHE PARAMS', params);
  const cacheKey = makeDeterministicCacheKey(`admin:${id}`, params);
  console.log('CACHE KEY', cacheKey);
  const ttlSeconds = opts.ttlSeconds ?? 60;

  const redis = getRedis();
  if (!redis) {
    console.log('CACHE MISS', { id, cacheKey, reason: 'redis_disabled' });
    return await fetcher();
  }

  try {
    if (redis.status !== 'ready') await redis.connect();
  } catch (e) {
    console.error('Redis connect error:', e);
    console.log('CACHE MISS', { id, cacheKey, reason: 'redis_connect_error' });
    return await fetcher();
  }

  try {
    const cached = await redis.get(cacheKey);
    if (cached != null) {
      console.log('CACHE HIT', { id, cacheKey });
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    // If parse fails (bad payload), delete and fall through to refetch.
    console.error('Redis cache read/parse error:', e);
    try {
      await redis.del(cacheKey);
    } catch {
      // ignore
    }
  }

  console.log('CACHE MISS', { id, cacheKey });
  const value = await fetcher();

  try {
    await redis.set(cacheKey, safeJsonStringify(value), 'EX', ttlSeconds);
  } catch (e) {
    console.error('Redis cache write error:', e);
  }

  return value;
}

