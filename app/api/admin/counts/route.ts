import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [
      users,
      incoming,
      inWarehouse,
      inTransit,
      warehouse,
      regions,
      stopped,
      delivered,
      payments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.parcel.count({ where: { status: 'pending' } }),
      prisma.parcel.count({ where: { status: 'in_warehouse' } }),
      prisma.parcel.count({ where: { status: 'in_transit' } }),
      prisma.parcel.count({ where: { status: 'arrived' } }),
      prisma.parcel.count({ where: { status: 'region' } }),
      prisma.parcel.count({ where: { status: 'cancelled' } }),
      prisma.parcel.count({ where: { status: 'delivered' } }),
      prisma.payment.count(),
    ]);

    return NextResponse.json(
      {
        users,
        incoming,
        inWarehouse,
        inTransit,
        warehouse,
        regions,
        stopped,
        delivered,
        payments,
      },
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
  }
}
