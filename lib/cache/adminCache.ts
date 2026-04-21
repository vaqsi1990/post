import { cacheAside, makeDeterministicCacheKey } from '@/lib/cache/redisCache';

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

export function adminChatThreadTag(threadId: string) {
  const id = (threadId ?? '').trim();
  return id ? `admin:chat:thread:${id}` : AdminCacheTags.chatThreads;
}

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

export async function cachedAdmin<T>(
  id: string,
  params: unknown,
  fetcher: () => Promise<T>,
  opts: AdminCacheOptions = {},
): Promise<T> {
  const cacheKey = makeDeterministicCacheKey(`admin:${id}`, params);
  const ttlSeconds = opts.ttlSeconds ?? 60;
  return await cacheAside(cacheKey, fetcher, { ttlSeconds, tags: opts.tags ?? [] });
}

