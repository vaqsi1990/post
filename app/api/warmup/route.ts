import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Vercel Cron warmup endpoint.
 * Keeps the Node runtime and DB connection warm to reduce cold-start tail latency.
 */
export async function GET() {
  try {
    // Minimal DB touch to warm Prisma/Neon connection.
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    // Warmup is best-effort; don't fail deployment health because of it.
    console.error('Warmup error:', e);
  }

  // Best-effort Redis warmup to avoid first-request connect latency.
  try {
    const redis = getRedis();
    if (redis) {
      if (redis.status !== 'ready') await redis.connect();
      await redis.ping();
    }
  } catch (e) {
    console.error('Warmup redis error:', e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

