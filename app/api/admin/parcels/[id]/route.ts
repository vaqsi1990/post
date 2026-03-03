import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const allowedStatuses = ['pending', 'in_transit', 'arrived', 'region', 'delivered', 'cancelled'] as const;

const updateParcelStatusSchema = z.object({
  status: z.enum(allowedStatuses),
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
    const data = updateParcelStatusSchema.parse(body);

    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'ამანათი ვერ მოიძებნა' }, { status: 404 });
    }

    const updatedParcel = await prisma.parcel.update({
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
        parcel: updatedParcel,
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

    console.error('Update parcel status error:', error);
    return NextResponse.json(
      { error: 'სტატუსის განახლებისას მოხდა შეცდომა' },
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

    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'ამანათი ვერ მოიძებნა' }, { status: 404 });
    }

    await prisma.parcel.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'ამანათი წარმატებით წაიშალა' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete parcel error:', error);
    return NextResponse.json(
      { error: 'ამანათის წაშლისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}

