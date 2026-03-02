import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  userId: z.string().min(1),
  totalAmount: z.number().min(0),
  weight: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'in_transit';

  const orders = await prisma.order.findMany({
    where: { status: status as string },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      orders: orders.map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt).toLocaleDateString('ka-GE'),
        currency: o.currency || 'GEL',
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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        status: 'in_transit',
        type: 'forwarding',
        totalAmount: data.totalAmount,
        currency: 'GEL',
        weight: data.weight ?? '',
        smsSent: false,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Order წარმატებით შეიქმნა',
      order: {
        ...order,
        createdAt: new Date(order.createdAt).toLocaleDateString('ka-GE'),
        currency: order.currency || 'GEL',
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Order-ის შექმნისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
