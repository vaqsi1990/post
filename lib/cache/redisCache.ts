import crypto from 'node:crypto';
import { getRedis } from '@/lib/redis';

const CACHE_NS = 'cache:v1';
const DEFAULT_TTL_SECONDS = 60;

type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const normalize = (v: unknown): Json => {
    if (v === null) return null;
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return v as string | number | boolean;
    if (t === 'bigint') return (v as bigint).toString();
    if (t === 'undefined') return null;
    if (t === 'function' || t === 'symbol') return null;

    if (v instanceof Date) return v.toISOString();
    if (v instanceof Error) return { name: v.name, message: v.message };
    if (Array.isArray(v)) return v.map(normalize);

    if (t === 'object') {
      const obj = v as Record<string, unknown>;
      if (seen.has(obj)) return '[Circular]';
      seen.add(obj);
      const out: Record<string, Json> = {};
      for (const k of Object.keys(obj).sort()) out[k] = normalize(obj[k]);
      return out;
    }

    return String(v);
  };

  return JSON.stringify(normalize(value));
}

export function makeDeterministicCacheKey(query: string, params: unknown): string {
  const raw = `${query}\n${stableStringify(params)}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return `${CACHE_NS}:${hash}`;
}

async function safeConnect() {
  const redis = getRedis();
  if (!redis) return null;
  try {
    if (redis.status !== 'ready') await redis.connect();
    return redis;
  } catch (e) {
    console.error('Redis connect error:', e);
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function releaseLock(lockKey: string, token: string) {
  const redis = await safeConnect();
  if (!redis) return;
  try {
    // atomic compare-and-del
    await redis.eval(
      `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `,
      1,
      lockKey,
      token
    );
  } catch (e) {
    console.error('Redis lock release error:', e);
  }
}

export async function invalidateCacheTags(tags: string[]) {
  const redis = await safeConnect();
  if (!redis) return;
  const unique = Array.from(new Set(tags.filter(Boolean)));
  if (unique.length === 0) return;

  try {
    for (const tag of unique) {
      const tagKey = `${CACHE_NS}:tag:${tag}`;
      const keys = await redis.smembers(tagKey);
      if (keys.length > 0) await redis.del(...keys);
      await redis.del(tagKey);
    }
  } catch (e) {
    console.error('Redis invalidate tags error:', e);
  }
}

export async function invalidateCacheKey(cacheKey: string) {
  const redis = await safeConnect();
  if (!redis) return;
  try {
    await redis.del(cacheKey);
  } catch (e) {
    console.error('Redis invalidate key error:', e);
  }
}

type CacheAsideOptions = {
  ttlSeconds?: number;
  tags?: string[];
  // stampede control
  lockTtlMs?: number;
  waitForLockMs?: number;
};

export async function cacheAside<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  opts: CacheAsideOptions = {}
): Promise<T> {
  const ttlSeconds = opts.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const lockTtlMs = opts.lockTtlMs ?? 5_000;
  const waitForLockMs = opts.waitForLockMs ?? 2_000;
  const tags = opts.tags ?? [];

  const redis = await safeConnect();
  if (!redis) return await fetcher();

  try {
    const cached = await redis.get(cacheKey);
    if (cached != null) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    console.error('Redis read/parse error:', e);
    // continue to DB
  }

  const lockKey = `${cacheKey}:lock`;
  const token = crypto.randomUUID();

  let haveLock = false;
  try {
    const ok = await redis.set(lockKey, token, 'PX', lockTtlMs, 'NX');
    haveLock = ok === 'OK';
  } catch (e) {
    console.error('Redis lock acquire error:', e);
  }

  if (!haveLock) {
    // Another worker is fetching. Wait briefly and retry cache.
    const started = Date.now();
    while (Date.now() - started < waitForLockMs) {
      const jitter = 30 + Math.floor(Math.random() * 70);
      await sleep(jitter);
      try {
        const cached = await redis.get(cacheKey);
        if (cached != null) {
          return JSON.parse(cached) as T;
        }
      } catch (e) {
        console.error('Redis retry read/parse error:', e);
        break;
      }
    }
    // Fallback: compute without caching (avoids dogpile on Redis failure / slow lock holder).
    return await fetcher();
  }

  try {
    // Double-check cache after lock to avoid duplicate work.
    try {
      const cached = await redis.get(cacheKey);
      if (cached != null) {
        return JSON.parse(cached) as T;
      }
    } catch (e) {
      console.error('Redis read/parse after lock error:', e);
    }

    const value = await fetcher();
    try {
      await redis.set(cacheKey, JSON.stringify(value), 'EX', ttlSeconds);

      const uniqueTags = Array.from(new Set(tags.filter(Boolean)));
      if (uniqueTags.length > 0) {
        for (const tag of uniqueTags) {
          const tagKey = `${CACHE_NS}:tag:${tag}`;
          await redis.sadd(tagKey, cacheKey);
          // keep tag sets around long enough to be useful for invalidation
          await redis.expire(tagKey, Math.max(ttlSeconds * 10, 600));
        }
      }
    } catch (e) {
      console.error('Redis write error:', e);
    }
    return value;
  } finally {
    await releaseLock(lockKey, token);
  }
}

