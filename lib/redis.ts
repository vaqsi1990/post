import Redis from 'ioredis';

declare global {
  var __redis__: Redis | undefined;
}

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (typeof url !== 'string') return null;
  if (url.trim().length === 0) return null;
  return url.trim();
}

export function getRedis(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;

  if (global.__redis__) return global.__redis__;

  const client = new Redis(url, {
    lazyConnect: true,
    enableReadyCheck: true,
    // Avoid request tail-latency spikes when Redis is connecting/reconnecting:
    // don't queue commands offline; fail fast so callers can fallback.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2_000,
    commandTimeout: 1_000,
  });

  client.on('error', (err) => {
    // Redis is an optimization; never crash the app for it.
    console.error('Redis error:', err);
  });

  global.__redis__ = client;
  return client;
}

