import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();

  if (!code) {
    return NextResponse.json(
      { error: 'შეიყვანეთ თრექინგ კოდი' },
      { status: 400 }
    );
  }

  const parcel = await prisma.parcel.findFirst({
    where: {
      userId: session.user.id,
      trackingNumber: { equals: code, mode: 'insensitive' },
    },
    include: {
      tracking: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!parcel) {
    return NextResponse.json(
      { error: 'ამანათი ვერ მოიძებნა' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    parcel: {
      id: parcel.id,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      weight: parcel.weight,
      price: parcel.price,
      currency: parcel.currency,
      originCountry: parcel.originCountry,
      createdAt: new Date(parcel.createdAt).toISOString(),
      tracking: parcel.tracking.map((t) => ({
        status: t.status,
        location: t.location,
        description: t.description,
        createdAt: new Date(t.createdAt).toISOString(),
      })),
    },
  });
}
