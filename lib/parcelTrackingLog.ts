import type { PrismaClient } from '@/app/generated/prisma/client';

type Db = Pick<PrismaClient, 'tracking'>;

/**
 * ინახავს თრექინგის ღილაკს ამანათის ისტორიისთვის (საჯარო /tracking და დაშბორდი).
 */
export async function recordParcelTrackingEvent(
  db: Db,
  parcelId: string,
  status: string,
  meta?: { location?: string | null; description?: string | null },
) {
  await db.tracking.create({
    data: {
      parcelId,
      status,
      location: meta?.location ?? null,
      description: meta?.description ?? null,
    },
  });
}
