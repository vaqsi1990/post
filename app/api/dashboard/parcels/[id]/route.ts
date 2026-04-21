import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { resolveTariffForParcel } from '@/lib/tariffLookup';
import { convertToGel, fetchNbgRates } from '@/lib/nbgRates';
import { cachedDashboard, dashUserParcelIdTag, dashUserParcelsTag, dashUserParcelsStatusTag } from '@/lib/cache/dashboardCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

export const dynamic = 'force-dynamic';

const ORIGIN_COUNTRY_CODES = ['uk', 'us', 'cn', 'gr', 'fr', 'tr'] as const;

const optionalNumberFromString = z.preprocess(
  (v) => {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!trimmed) return undefined;
      return Number(trimmed.replace(',', '.'));
    }
    return v;
  },
  z.number(),
);

const optionalIntFromString = z.preprocess(
  (v) => {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!trimmed) return undefined;
      return parseInt(trimmed, 10);
    }
    return v;
  },
  z.number().int(),
);

const patchSchema = z
  .object({
    price: z.preprocess(
      (v) => (typeof v === 'string' ? Number(v.trim().replace(',', '.')) : v),
      z.number().min(0).optional(),
    ),
    onlineShop: z.string().trim().min(1).optional(),
    quantity: optionalIntFromString.optional().refine((v) => v === undefined || v >= 1, 'Quantity is invalid'),
    originCountry: z.enum(ORIGIN_COUNTRY_CODES).optional(),
    weight: optionalNumberFromString.optional().refine((v) => v === undefined || v >= 0.001, 'Weight is invalid'),
    description: z.string().trim().min(1).optional(),
    comment: z.string().trim().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = session.user.id;
  const { id } = await params;

  const parcel = await cachedDashboard(
    'parcel:edit:get:v1',
    { userId, id },
    async () => {
      return await prisma.parcel.findFirst({
        where: { id, userId },
        select: {
          id: true,
          status: true,
          price: true,
          onlineShop: true,
          quantity: true,
          originCountry: true,
          weight: true,
          description: true,
          comment: true,
        },
      });
    },
    { ttlSeconds: 60, tags: [dashUserParcelIdTag(userId, id)] },
  );

  if (!parcel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (parcel.status !== 'pending') {
    return NextResponse.json({ error: 'This parcel can no longer be edited.' }, { status: 400 });
  }

  return NextResponse.json({ parcel }, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = session.user.id;
  const { id } = await params;

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    const existing = await prisma.parcel.findFirst({
      where: { id, userId },
      select: {
        id: true,
        status: true,
        filePath: true,
      },
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.status !== 'pending') {
      return NextResponse.json({ error: 'This parcel can no longer be edited.' }, { status: 400 });
    }

    // If user raises price into invoice-required zone, ensure there is already a PDF.
    const nextPrice = data.price;
    if (nextPrice != null && nextPrice >= 296 && !existing.filePath) {
      return NextResponse.json(
        { error: '296 ლარიდან ინვოისის PDF ფაილი აუცილებელია (რედაქტირებისთვის ჯერ ატვირთეთ PDF).' },
        { status: 400 },
      );
    }

    const tariffsForCalc = await getCachedActiveTariffsForGeorgia();

    // Recalculate shippingAmount if weight/origin changed (or if it exists and we want to keep consistent).
    const updatedRow = await prisma.$transaction(async (tx) => {
      const updated = await tx.parcel.update({
        where: { id },
        data: {
          ...(data.price != null ? { price: data.price } : {}),
          ...(data.onlineShop != null ? { onlineShop: data.onlineShop } : {}),
          ...(data.quantity != null ? { quantity: data.quantity as number } : {}),
          ...(data.originCountry != null ? { originCountry: data.originCountry } : {}),
          ...(data.comment !== undefined ? { comment: data.comment || null } : {}),
          ...(data.weight !== undefined ? { weight: data.weight ?? null } : {}),
          ...(data.description != null ? { description: data.description } : {}),
        },
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          price: true,
          onlineShop: true,
          quantity: true,
          originCountry: true,
          weight: true,
          description: true,
          comment: true,
          shippingAmount: true,
          currency: true,
          filePath: true,
          createdAt: true,
          courierServiceRequested: true,
          courierFeeAmount: true,
          payableAmount: true,
        },
      });

      let shippingAmount: number | null = null;
      if (updated.weight != null) {
        const resolved = resolveTariffForParcel(
          tariffsForCalc,
          updated.originCountry,
          updated.weight,
        );
        if (!resolved) {
          // Keep existing if no tariff now; still allow edit (e.g., editing comment).
          shippingAmount = updated.shippingAmount ?? null;
        } else {
          const nbgRates = await fetchNbgRates().catch(() => null);
          const converted =
            nbgRates ? convertToGel(nbgRates, resolved.shippingTotal, resolved.currency) : null;
          shippingAmount =
            converted != null ? Math.round(converted * 100) / 100 : resolved.shippingTotal;
        }
      }

      if (shippingAmount !== (updated.shippingAmount ?? null)) {
        return await tx.parcel.update({
          where: { id: updated.id },
          data: { shippingAmount, currency: 'GEL' },
          select: {
            id: true,
            trackingNumber: true,
            status: true,
            price: true,
            onlineShop: true,
            quantity: true,
            originCountry: true,
            weight: true,
            description: true,
            comment: true,
            shippingAmount: true,
            currency: true,
            filePath: true,
            createdAt: true,
            courierServiceRequested: true,
            courierFeeAmount: true,
            payableAmount: true,
          },
        });
      }

      return updated;
    });

    void invalidateCacheTags([
      dashUserParcelIdTag(userId, id),
      dashUserParcelsTag(userId),
      dashUserParcelsStatusTag(userId, 'pending'),
      dashUserParcelsStatusTag(userId, 'in_warehouse'),
      dashUserParcelsStatusTag(userId, 'in_transit'),
      dashUserParcelsStatusTag(userId, 'arrived'),
      dashUserParcelsStatusTag(userId, 'stopped'),
      dashUserParcelsStatusTag(userId, 'delivered'),
    ]);

    return NextResponse.json(
      {
        parcel: {
          ...updatedRow,
          createdAt: new Date(updatedRow.createdAt).toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('Dashboard parcel update error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

