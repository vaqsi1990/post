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

type ParcelCursor = {
  id: string;
  createdAt: string; // ISO
  originCountry?: string | null;
};

function parseCursor(raw: string | null): ParcelCursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const p = parsed as Partial<ParcelCursor>;
    if (!p.id || typeof p.id !== 'string') return null;
    if (!p.createdAt || typeof p.createdAt !== 'string') return null;
    return {
      id: p.id,
      createdAt: p.createdAt,
      originCountry: 'originCountry' in p ? (p.originCountry ?? null) : undefined,
    };
  } catch {
    return null;
  }
}

function makeCursor(c: ParcelCursor): string {
  return Buffer.from(JSON.stringify(c), 'utf8').toString('base64url');
}

function countryFilterWhere(country: string | null): Prisma.ParcelWhereInput | undefined {
  if (!country) return undefined;
  if (country === UNKNOWN_COUNTRY_KEY) {
    return { OR: [{ originCountry: null }, { originCountry: '' }] };
  }
  return { originCountry: { equals: country, mode: 'insensitive' } };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout_${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
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
  const cursorRaw = searchParams.get('cursor');
  const cursor = parseCursor(cursorRaw);
  const limitRaw = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : ADMIN_PARCEL_PAGE_SIZE,
    ),
  );
  const countryParam = searchParams.get('country')?.trim() || null;
  const includeShipping =
    (searchParams.get('includeShipping') ?? '').trim() === '1';

  const countryWhere = countryFilterWhere(countryParam);
  const where: Prisma.ParcelWhereInput = {
    status,
    ...(countryWhere ? countryWhere : {}),
  };

  const orderBy = adminParcelsOrderBy(status);
  try {
    // Incoming (pending) must reflect newly created parcels immediately.
    // Avoid serving stale cache for this status; otherwise new parcels can "disappear"
    // after refresh when the client re-fetches from the API.
    const isIncoming = status === 'pending';
    // Even with tag invalidation, Redis might be temporarily unavailable during cold starts.
    // Keeping a near-zero TTL for incoming avoids "new parcel appears after 60s" behavior.
    const ttlSeconds = isIncoming ? 1 : 60;
    const staleSeconds = isIncoming ? 0 : 300;

    // Cache expensive aggregates separately from page results.
    // This avoids repeating COUNT/GROUP BY work for every page cache key.
    const meta = await cachedAdmin(
      'parcels:meta:v1',
      {
        role: session.user.role,
        status,
        country: countryParam,
      },
      async () => {
        const [totalCount, originGroups] = await Promise.all([
          prisma.parcel.count({ where }),
          prisma.parcel.groupBy({
            by: ['originCountry'],
            // Keep counts consistent with the active filter (incl. country if provided).
            where,
            _count: { _all: true },
          }),
        ]);

        const originCounts: Record<string, number> = {};
        for (const g of originGroups) {
          const k = parcelOriginKey(g.originCountry);
          originCounts[k] = (originCounts[k] ?? 0) + g._count._all;
        }

        return { totalCount, originCounts };
      },
      {
        ttlSeconds,
        staleSeconds,
        tags: [AdminCacheTags.parcels, adminParcelsTag(status), AdminCacheTags.counts],
      },
    );

    const pageData = await cachedAdmin(
      'parcels:page:v3',
      // Keep params deterministic: cache key stability matters.
      {
        role: session.user.role,
        status,
        page,
        cursor: cursorRaw,
        limit,
        country: countryParam,
        orderBy,
        includeShipping,
      },
      async () => {
        const cursorDate =
          cursor?.createdAt && Number.isFinite(Date.parse(cursor.createdAt))
            ? new Date(cursor.createdAt)
            : null;

        // Keyset pagination (cursor) avoids expensive OFFSET (skip) on high pages.
        // Fallback to page-based pagination if cursor is absent/invalid.
        let paginationWhere: Prisma.ParcelWhereInput | undefined;
        if (cursor && cursorDate) {
          if (status === 'region' || status === 'pending') {
            paginationWhere = {
              OR: [
                { createdAt: { lt: cursorDate } },
                { createdAt: { equals: cursorDate }, id: { lt: cursor.id } },
              ],
            };
          } else {
            const origin = cursor.originCountry ?? '';
            paginationWhere = {
              OR: [
                { originCountry: { gt: origin } },
                {
                  AND: [
                    { originCountry: { equals: origin } },
                    {
                      OR: [
                        { createdAt: { lt: cursorDate } },
                        { createdAt: { equals: cursorDate }, id: { lt: cursor.id } },
                      ],
                    },
                  ],
                },
              ],
            };
          }
        }

        const whereWithPagination: Prisma.ParcelWhereInput = paginationWhere
          ? { AND: [where, paginationWhere] }
          : where;

        const [parcels, tariffs, nbgRates] = await Promise.all([
          prisma.parcel.findMany({
            where: whereWithPagination,
            orderBy,
            ...(paginationWhere
              ? { take: limit }
              : { skip: (page - 1) * limit, take: limit }),
            select: {
              id: true,
              trackingNumber: true,
              status: true,
              price: true,
              currency: true,
              weight: true,
              originCountry: true,
              quantity: true,
              customerName: true,
              createdAt: true,
              filePath: true,
              courierServiceRequested: true,
              courierFeeAmount: true,
              payableAmount: true,
              shippingAmount: true,
              user: adminParcelInclude.user,
              createdBy: adminParcelInclude.createdBy,
            },
          }),
          includeShipping ? getCachedActiveTariffsForGeorgia() : Promise.resolve([]),
          includeShipping
            ? withTimeout(fetchNbgRates().catch(() => null), 1200).catch(() => null)
            : Promise.resolve(null),
        ]);

        const last = parcels.length > 0 ? parcels[parcels.length - 1] : null;
        const nextCursor =
          last && parcels.length === limit
            ? makeCursor({
                id: last.id,
                createdAt: last.createdAt.toISOString(),
                originCountry:
                  status === 'region' || status === 'pending'
                    ? undefined
                    : (last.originCountry ?? null),
              })
            : null;

        return {
          parcels: parcels.map((p) => {
            const breakdown = includeShipping
              ? computeShippingGelBreakdown(
                  { originCountry: p.originCountry, weight: p.weight },
                  tariffs,
                  nbgRates,
                )
              : null;
            return {
              ...p,
              shippingAmount: breakdown != null ? breakdown.amountGel : p.shippingAmount,
              shippingFormula: breakdown != null ? breakdown.formula : null,
            };
          }),
          nextCursor,
        };
      },
      {
        ttlSeconds,
        staleSeconds,
        tags: [AdminCacheTags.parcels, adminParcelsTag(status)],
      },
    );

    const totalPages = Math.max(1, Math.ceil(meta.totalCount / limit));
    const data = {
      ...pageData,
      page,
      pageSize: limit,
      totalCount: meta.totalCount,
      totalPages,
      originCounts: meta.originCounts,
    };

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

