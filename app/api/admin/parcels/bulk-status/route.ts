import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminCacheTags } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';
import { Prisma } from '@/app/generated/prisma/client';

export const dynamic = 'force-dynamic';

const allowedStatuses = [
  'pending',
  'in_warehouse',
  'in_transit',
  'arrived',
  'region',
  'delivered',
  'stopped',
] as const;

const bulkStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
  status: z.enum(allowedStatuses),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ids, status } = bulkStatusSchema.parse(body);

    const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: 'ids is empty' }, { status: 400 });
    }

    const changed = await prisma.$transaction(async (tx) => {
      // One round-trip: update + return only rows that actually changed.
      // Keep this transaction minimal to reduce lock time and tail latency.
      const updatedRows = await tx.$queryRaw<{ id: string }[]>(
        Prisma.sql`UPDATE "parcels"
          SET "status" = ${status}::"ParcelStatus"
          WHERE "id" = ANY(ARRAY[${Prisma.join(uniqueIds)}]::text[])
            AND "status" <> ${status}::"ParcelStatus"
          RETURNING "id"`,
      );

      const updatedIds = updatedRows.map((r) => r.id);
      return {
        updatedCount: updatedIds.length,
        updatedIds,
      };
    });

    // Write tracking history out-of-band (best-effort) so this endpoint stays fast under load.
    if (changed.updatedIds.length > 0) {
      void prisma.tracking
        .createMany({
          data: changed.updatedIds.map((id) => ({
            parcelId: id,
            status,
            location: null,
            description: null,
          })),
        })
        .catch((e) => {
          console.error('Bulk parcel status tracking createMany error:', e);
        });
    }

    void invalidateCacheTags([AdminCacheTags.parcels, AdminCacheTags.counts]);

    return NextResponse.json(
      {
        message: 'Updated',
        status,
        updatedCount: changed.updatedCount,
        updatedIds: changed.updatedIds,
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ვალიდაციის შეცდომა', details: e.issues },
        { status: 400 },
      );
    }
    console.error('Bulk parcel status error:', e);
    return NextResponse.json({ error: 'განახლებისას მოხდა შეცდომა' }, { status: 500 });
  }
}

