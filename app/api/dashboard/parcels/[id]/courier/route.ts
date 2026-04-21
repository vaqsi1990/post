import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../../../lib/auth';
import prisma from '../../../../../../lib/prisma';
import { dashUserParcelIdTag, dashUserParcelsTag, dashUserParcelsStatusTag } from '@/lib/cache/dashboardCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

const patchSchema = z.object({
  courierServiceRequested: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { courierServiceRequested } = patchSchema.parse(body);

    const parcel = await prisma.parcel.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'ამანათი ვერ მოიძებნა' }, { status: 404 });
    }

    if (parcel.status !== 'arrived') {
      return NextResponse.json(
        { error: 'საკურიერო მომსახურება მხოლოდ ჩამოსული ამანათისთვისაა ხელმისაწვდომი' },
        { status: 400 },
      );
    }

    const updated = await prisma.parcel.update({
      where: { id: parcel.id },
      data: { courierServiceRequested },
      select: {
        id: true,
        courierServiceRequested: true,
      },
    });

    void invalidateCacheTags([
      dashUserParcelIdTag(session.user.id, id),
      dashUserParcelsTag(session.user.id),
      dashUserParcelsStatusTag(session.user.id, 'arrived'),
    ]);

    return NextResponse.json({ parcel: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'არასწორი მონაცემები', details: error.issues },
        { status: 400 },
      );
    }
    console.error('PATCH courier:', error);
    return NextResponse.json({ error: 'დაფიქსირდა შეცდომა' }, { status: 500 });
  }
}
