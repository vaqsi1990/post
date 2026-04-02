import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recordParcelTrackingEvent } from '@/lib/parcelTrackingLog';

const allowedStatuses = ['pending', 'in_transit', 'arrived', 'region', 'delivered', 'cancelled'] as const;

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  city: true,
  address: true,
} as const;

const createdBySelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  employeeCountry: true,
} as const;

const patchParcelSchema = z
  .object({
    status: z.enum(allowedStatuses).optional(),
    courierFeeAmount: z.union([z.number().min(0), z.null()]).optional(),
    payableAmount: z.union([z.number().min(0), z.null()]).optional(),
  })
  .refine(
    (d) =>
      d.status !== undefined ||
      d.courierFeeAmount !== undefined ||
      d.payableAmount !== undefined,
    { message: 'მინიმუმ ერთი ველი სავალდებულოა' },
  );

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
    const data = patchParcelSchema.parse(body);

    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'ამანათი ვერ მოიძებნა' }, { status: 404 });
    }

    const statusChanged =
      data.status !== undefined && data.status !== parcel.status;

    const updatedParcel = await prisma.$transaction(async (tx) => {
      const next = await tx.parcel.update({
        where: { id },
        data: {
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.courierFeeAmount !== undefined ? { courierFeeAmount: data.courierFeeAmount } : {}),
          ...(data.payableAmount !== undefined ? { payableAmount: data.payableAmount } : {}),
        },
        include: {
          user: {
            select: userSelect,
          },
          createdBy: {
            select: createdBySelect,
          },
        },
      });

      if (statusChanged && data.status !== undefined) {
        await recordParcelTrackingEvent(tx, id, data.status);
      }

      return next;
    });

    return NextResponse.json(
      {
        message: 'განახლდა',
        parcel: {
          ...updatedParcel,
          createdAt: new Date(updatedParcel.createdAt).toLocaleDateString('ka-GE'),
        },
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

    console.error('Update parcel error:', error);
    return NextResponse.json(
      { error: 'განახლებისას მოხდა შეცდომა' },
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
