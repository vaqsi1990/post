import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const topUpSchema = z.object({
  amount: z.number().min(0.01, 'მინიმუმ 0.01'),
  currency: z.string().length(3).optional().default('USD'),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = session.user.id;

  const result = await prisma.payment.aggregate({
    where: {
      userId,
      parcelId: null,
      orderId: null,
      status: 'completed',
    },
    _sum: { amount: true },
  });

  const balance = result._sum.amount ?? 0;

  return NextResponse.json(
    { balance, currency: 'USD' },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

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
    const data = topUpSchema.parse(body);
    const userId = session.user.id;

    await prisma.payment.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency,
        status: 'completed',
        paymentMethod: 'card',
        parcelId: null,
        orderId: null,
        transactionId: `topup-${Date.now()}-${userId.slice(0, 8)}`,
      },
    });

    const result = await prisma.payment.aggregate({
      where: {
        userId,
        parcelId: null,
        orderId: null,
        status: 'completed',
      },
      _sum: { amount: true },
    });
    const newBalance = result._sum.amount ?? 0;

    return NextResponse.json(
      {
        message: 'ბალანსი წარმატებით შეივსო',
        balance: newBalance,
        currency: data.currency,
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
    console.error('Balance top-up error:', err);
    return NextResponse.json(
      { error: 'ბალანსის შევსებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
