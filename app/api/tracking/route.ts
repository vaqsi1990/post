import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_EVENTS = 80;

/**
 * საჯარო თრექინგი — მხოლოდ თრექინგ ნომრით, პერსონალური მონაცემების გარეშე.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();

  if (!code) {
    return NextResponse.json(
      { error: 'code_required' },
      { status: 400 },
    );
  }

  if (code.length > 120) {
    return NextResponse.json(
      { error: 'code_invalid' },
      { status: 400 },
    );
  }

  const parcel = await prisma.parcel.findFirst({
    where: {
      trackingNumber: { equals: code, mode: 'insensitive' },
    },
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      originCountry: true,
      onlineShop: true,
      weight: true,
      createdAt: true,
      shippedAt: true,
      arrivedAt: true,
      readyAt: true,
      deliveredAt: true,
      tracking: {
        orderBy: { createdAt: 'asc' },
        take: MAX_EVENTS,
        select: {
          id: true,
          status: true,
          location: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!parcel) {
    return NextResponse.json(
      { error: 'not_found' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    parcel: {
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      originCountry: parcel.originCountry,
      onlineShop: parcel.onlineShop,
      weight: parcel.weight,
      createdAt: new Date(parcel.createdAt).toISOString(),
      shippedAt: parcel.shippedAt ? new Date(parcel.shippedAt).toISOString() : null,
      arrivedAt: parcel.arrivedAt ? new Date(parcel.arrivedAt).toISOString() : null,
      readyAt: parcel.readyAt ? new Date(parcel.readyAt).toISOString() : null,
      deliveredAt: parcel.deliveredAt ? new Date(parcel.deliveredAt).toISOString() : null,
      events: parcel.tracking.map((e) => ({
        id: e.id,
        status: e.status,
        location: e.location,
        description: e.description,
        createdAt: new Date(e.createdAt).toISOString(),
      })),
    },
  });
}
