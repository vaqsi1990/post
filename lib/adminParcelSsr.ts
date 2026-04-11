import type { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import {
  ADMIN_PARCEL_PAGE_SIZE,
  adminParcelsOrderBy,
  parseAdminParcelPage,
} from '@/lib/adminParcelList';

/**
 * ადმინის სიის SSR — იგივე გვერდის ზომა/რიგი, რაც GET /api/admin/parcels-ს.
 */
export async function fetchAdminParcelsSsr(
  status: string,
  searchParams: { page?: string },
): Promise<{
  parcels: Prisma.ParcelGetPayload<{ include: typeof adminParcelInclude }>[];
  page: number;
  totalCount: number;
  totalPages: number;
}> {
  const page = parseAdminParcelPage(searchParams.page);
  const where: Prisma.ParcelWhereInput = {
    status: status as Prisma.ParcelWhereInput['status'],
  };
  const orderBy = adminParcelsOrderBy(status);
  const skip = (page - 1) * ADMIN_PARCEL_PAGE_SIZE;

  const [totalCount, parcels] = await Promise.all([
    prisma.parcel.count({ where }),
    prisma.parcel.findMany({
      where,
      orderBy,
      skip,
      take: ADMIN_PARCEL_PAGE_SIZE,
      include: adminParcelInclude,
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / ADMIN_PARCEL_PAGE_SIZE),
  );

  return { parcels, page, totalCount, totalPages };
}
