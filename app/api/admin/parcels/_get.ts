import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Prisma } from '@/app/generated/prisma/client';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  ADMIN_PARCEL_PAGE_SIZE,
  adminParcelsOrderBy,
  parseAdminParcelPage,
} from '@/lib/adminParcelList';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { UNKNOWN_COUNTRY_KEY, parcelOriginKey } from '@/lib/parcelOriginKey';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import { fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import { cachedAdmin, AdminCacheTags, adminParcelsTag } from '@/lib/cache/adminCache';

const allowedStatuses = [
  'pending',
  'in_warehouse',
  'in_transit',
  'arrived',
  'region',
  'delivered',
  'stopped',
] as const;

function isAllowedStatus(status: string): status is (typeof allowedStatuses)[number] {
  return (allowedStatuses as readonly string[]).includes(status);
}

function countryFilterWhere(country: string | null): Prisma.ParcelWhereInput | undefined {
  if (!country) return undefined;
  if (country === UNKNOWN_COUNTRY_KEY) {
    return { OR: [{ originCountry: null }, { originCountry: '' }] };
  }
  return { originCountry: { equals: country, mode: 'insensitive' } };
}

export async function handleAdminParcelsGet(request: NextRequest) {
  const t0 = Date.now();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  if (!isAllowedStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const page = parseAdminParcelPage(searchParams.get('page') ?? undefined);
  const limitRaw = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : ADMIN_PARCEL_PAGE_SIZE,
    ),
  );
  const countryParam = searchParams.get('country')?.trim() || null;

  const countryWhere = countryFilterWhere(countryParam);
  const where: Prisma.ParcelWhereInput = {
    status,
    ...(countryWhere ? countryWhere : {}),
  };

  const orderBy = adminParcelsOrderBy(status);

  try {
    const data = await cachedAdmin(
      'parcels:list:v1',
      // Keep params deterministic: cache key stability matters.
      { role: session.user.role, status, page, limit, country: countryParam, orderBy },
      async () => {
        const [totalCount, parcels, originGroups, tariffs, nbgRates] = await Promise.all([
          prisma.parcel.count({ where }),
          prisma.parcel.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: adminParcelInclude,
          }),
          prisma.parcel.groupBy({
            by: ['originCountry'],
            where: { status },
            _count: { _all: true },
          }),
          getCachedActiveTariffsForGeorgia(),
          fetchNbgRates().catch(() => null),
        ]);

        const originCounts: Record<string, number> = {};
        for (const g of originGroups) {
          const k = parcelOriginKey(g.originCountry);
          originCounts[k] = (originCounts[k] ?? 0) + g._count._all;
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / limit));

        return {
          parcels: parcels.map((p) => {
            const breakdown = computeShippingGelBreakdown(
              { originCountry: p.originCountry, weight: p.weight },
              tariffs,
              nbgRates,
            );
            return {
              ...p,
              createdAt: new Date(p.createdAt).toLocaleDateString('ka-GE'),
              shippingAmount: breakdown != null ? breakdown.amountGel : p.shippingAmount,
              shippingFormula: breakdown != null ? breakdown.formula : null,
            };
          }),
          page,
          pageSize: limit,
          totalCount,
          totalPages,
          originCounts,
        };
      },
      {
        ttlSeconds: 60,
        tags: [AdminCacheTags.parcels, adminParcelsTag(status), AdminCacheTags.counts],
      },
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } finally {
    if (process.env.REQUEST_TIMING_DEBUG === '1') {
      console.log('[timing]', 'GET /api/admin/parcels', {
        status,
        page,
        limit,
        country: countryParam,
        ms: Date.now() - t0,
      });
    }
  }
}

