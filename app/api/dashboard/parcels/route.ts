import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const createParcelSchema = z.object({
  trackingNumber: z.string().min(1, 'თრექინგ კოდი აუცილებელია'),
  originCountry: z.string().min(1, 'ქვეყანა აუცილებელია').default('US'),
  originAddress: z.string().min(1, 'მისამართი აუცილებელია').default(''),
  weight: z.number().min(0).default(0),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createParcelSchema.parse(body);
    const userId = session.user.id;

    const existing = await prisma.parcel.findUnique({
      where: { trackingNumber: data.trackingNumber.trim() },
    });
    if (existing) {
      if (existing.userId === userId) {
        return NextResponse.json(
          { error: 'ამ თრექინგ კოდით ამანათი უკვე დამატებული გაქვთ' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'ამ თრექინგ კოდით ამანათი სხვა მომხმარებელს ეკუთვნის' },
        { status: 409 }
      );
    }

    const parcel = await prisma.parcel.create({
      data: {
        userId,
        trackingNumber: data.trackingNumber.trim(),
        originCountry: data.originCountry,
        originAddress: data.originAddress || '—',
        weight: data.weight,
        description: data.description ?? null,
        price: 0,
        currency: 'USD',
      },
    });

    return NextResponse.json(
      {
        message: 'ამანათი წარმატებით დაემატა',
        parcel: {
          id: parcel.id,
          trackingNumber: parcel.trackingNumber,
          status: parcel.status,
          createdAt: new Date(parcel.createdAt).toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('Create parcel error:', err);
    return NextResponse.json(
      { error: 'ამანათის დამატებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
