import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
  return NextResponse.json({ ok: true }, { status: 200 });
}

