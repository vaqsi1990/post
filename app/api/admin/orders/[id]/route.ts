import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

const updateOrderStatusSchema = z.object({
  status: z.enum(['in_transit', 'warehouse', 'stopped', 'delivered', 'pending', 'processing', 'completed', 'cancelled']),
});

const updateOrderSchema = z.object({
  userId: z.string().min(1, 'მომხმარებელი აუცილებელია').optional(),
  type: z.enum(['forwarding', 'customs', 'courier', 'corporate']).optional(),
  status: z.enum(['in_transit', 'warehouse', 'stopped', 'delivered', 'pending', 'processing', 'completed', 'cancelled']).optional(),
  totalAmount: z.number().min(0, 'თანხა უნდა იყოს დადებითი').optional(),
  currency: z.string().optional(),
  weight: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order ვერ მოიძებნა' }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
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

    return NextResponse.json(
      {
        message: 'სტატუსი წარმატებით განახლდა',
        order: updatedOrder,
      },
      { status: 200 }
    );
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

    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'სტატუსის განახლებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateOrderSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order ვერ მოიძებნა' }, { status: 404 });
    }

    // Verify user exists if userId is being updated
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(data.userId && { userId: data.userId }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.notes !== undefined && { notes: data.notes }),
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

    return NextResponse.json(
      {
        message: 'Order წარმატებით განახლდა',
        order: updatedOrder,
      },
      { status: 200 }
    );
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

    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Order-ის განახლებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order ვერ მოიძებნა' }, { status: 404 });
    }

    // Delete order
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Order წარმატებით წაიშალა' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Order-ის წაშლისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
