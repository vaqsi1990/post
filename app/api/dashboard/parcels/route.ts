import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const createParcelSchema = z.object({
  customerName: z.string().min(1, 'მომხმარებლის სახელი აუცილებელია'),
  trackingNumber: z.string().min(1, 'თრექინგ კოდი აუცილებელია'),
  price: z.number().min(0, 'ფასი აუცილებელია'),
  onlineShop: z.string().min(1, 'ონლაინ მაღაზია აუცილებელია'),
  quantity: z.number().int().min(1, 'ამანათის რაოდენობა აუცილებელია'),
  comment: z.string().optional(),
  originCountry: z.string().optional(),
  originAddress: z.string().optional(),
  weight: z.number().min(0).optional(),
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
        customerName: data.customerName.trim(),
        trackingNumber: data.trackingNumber.trim(),
        price: data.price,
        onlineShop: data.onlineShop.trim(),
        quantity: data.quantity,
        comment: data.comment?.trim() ?? null,
        originCountry: data.originCountry?.trim() ?? null,
        originAddress: data.originAddress?.trim() ?? null,
        weight: data.weight ?? null,
        description: data.description?.trim() ?? null,
        currency: 'GEL',
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
