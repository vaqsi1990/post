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
    maxRetriesPerRequest: 2,
    connectTimeout: 5_000,
  });

  client.on('error', (err) => {
    // Redis is an optimization; never crash the app for it.
    console.error('Redis error:', err);
  });

  global.__redis__ = client;
  return client;
}

