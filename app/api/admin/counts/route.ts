import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cachedAdmin } from '@/lib/cache/adminCache';
import { AdminCacheTags } from '@/lib/cache/adminCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const t0 = Date.now();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await cachedAdmin(
      'counts:v1',
      { role: session.user.role },
      async () => {
        console.log('FETCHING COUNTS FROM DB');
        const [users, payments, parcelCounts] = await Promise.all([
          prisma.user.count(),
          prisma.payment.count(),
          prisma.parcel.groupBy({
            by: ['status'],
            _count: { _all: true },
          }),
        ]);

        const byStatus = new Map<string, number>();
        for (const row of parcelCounts) {
          byStatus.set(row.status, row._count._all);
        }

        const incoming = byStatus.get('pending') ?? 0;
        const inWarehouse = byStatus.get('in_warehouse') ?? 0;
        const inTransit = byStatus.get('in_transit') ?? 0;
        const warehouse = byStatus.get('arrived') ?? 0;
        const regions = byStatus.get('region') ?? 0;
        const stopped = byStatus.get('stopped') ?? 0;
        const delivered = byStatus.get('delivered') ?? 0;

        return {
          users,
          incoming,
          inWarehouse,
          inTransit,
          warehouse,
          regions,
          stopped,
          delivered,
          payments,
        };
      },
      { ttlSeconds: 60, tags: [AdminCacheTags.counts] },
    );

    return NextResponse.json(
      data,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (e) {
    console.error('Admin counts error:', e);
    return NextResponse.json(
      { error: 'შეცდომა რაოდენობების წამოღებისას' },
      { status: 500 }
    );
  } finally {
    if (process.env.REQUEST_TIMING_DEBUG === '1') {
      console.log('[timing]', 'GET /api/admin/counts', { ms: Date.now() - t0 });
    }
  }
}
