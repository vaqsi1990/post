import type { Prisma } from '@/app/generated/prisma/client';

/** ადმინის ამანათების სია — იგივე ზომა API GET-თან და SSR-თან */
export const ADMIN_PARCEL_PAGE_SIZE = 15;

export function adminParcelsOrderBy(
  status: string,
): Prisma.ParcelOrderByWithRelationInput | Prisma.ParcelOrderByWithRelationInput[] {
  if (status === 'region') {
    return { createdAt: 'desc' };
  }
  return [{ originCountry: 'asc' }, { createdAt: 'desc' }];
}

export function parseAdminParcelPage(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}
