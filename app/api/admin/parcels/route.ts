import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const allowedStatuses = ['pending', 'in_transit', 'arrived', 'region', 'delivered', 'cancelled'] as const;

const updateParcelStatusSchema = z.object({
  status: z.enum(allowedStatuses),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  if (!allowedStatuses.includes(status as any)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const parcels = await prisma.parcel.findMany({
    where: { status: status as string },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          address: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      parcels: parcels.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt).toLocaleDateString('ka-GE'),
      })),
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

