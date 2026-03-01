import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = session.user.id;
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = orders.map((order) => ({
    id: order.id,
    type: order.type,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency || 'USD',
    weight: order.weight || '',
    notes: order.notes,
    createdAt: new Date(order.createdAt).toLocaleDateString('ka-GE'),
  }));

  return NextResponse.json(
    { orders: formatted },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
