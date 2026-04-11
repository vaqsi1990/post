import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recordParcelTrackingEvent } from '@/lib/parcelTrackingLog';
import { notifyParcelOwnerStatusSms } from '@/lib/parcelStatusSms';

/** თანამშრომელს შეუძლია მხოლოდ მოლოდინი / გზაში */
const allowedStatuses = ['pending', 'in_transit'] as const;

const patchSchema = z.object({
  status: z.enum(allowedStatuses),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status: nextStatus } = patchSchema.parse(body);

    const parcel = await prisma.parcel.findFirst({
      where: { id, createdById: session.user.id },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        originCountry: true,
        user: { select: { phone: true } },
      },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'ამანათი ვერ მოიძებნა' }, { status: 404 });
    }

    const statusChanged = nextStatus !== parcel.status;

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.parcel.update({
        where: { id: parcel.id },
        data: { status: nextStatus },
        select: {
          id: true,
          status: true,
          trackingNumber: true,
          customerName: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      });

      if (statusChanged) {
        await recordParcelTrackingEvent(tx, parcel.id, nextStatus);
      }

      return row;
    });

    if (statusChanged) {
      void notifyParcelOwnerStatusSms({
        parcelId: parcel.id,
        previousStatus: parcel.status,
        newStatus: nextStatus,
        trackingNumber: parcel.trackingNumber,
        ownerPhone: parcel.user.phone,
        originCountry: parcel.originCountry,
      });
    }

    return NextResponse.json(
      {
        message: 'განახლდა',
        parcel: updated,
      },
      { status: 200 },
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
        { status: 400 },
      );
    }

    console.error('Employee patch parcel:', error);
    return NextResponse.json(
      { error: 'განახლებისას მოხდა შეცდომა' },
      { status: 500 },
    );
  }
}
