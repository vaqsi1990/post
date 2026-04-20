import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { recordParcelTrackingEvent } from '@/lib/parcelTrackingLog';
import { notifyParcelOwnerStatusSms } from '@/lib/parcelStatusSms';
import { convertToGel, fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import { CURRENCY_BY_ORIGIN_ISO, FORM_TO_TARIFF_COUNTRY } from '@/lib/tariffLookup';

const allowedStatuses = [
  'pending',
  'in_warehouse',
  'in_transit',
  'arrived',
  'region',
  'delivered',
  'stopped',
] as const;

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
    weight: z.union([z.number().min(0.001), z.null()]).optional(),
  })
  .refine(
    (d) =>
      d.status !== undefined ||
      d.courierFeeAmount !== undefined ||
      d.payableAmount !== undefined ||
      d.weight !== undefined,
    { message: 'მინიმუმ ერთი ველი სავალდებულოა' },
  );

async function resolveShippingAfterWeightChange(
  weight: number,
  originCountry: string | null
): Promise<
  | { shippingAmount: number; shippingFormula: string | null }
  | { error: string }
> {
  const [tariffs, nbgRates] = await Promise.all([
    getCachedActiveTariffsForGeorgia(),
    fetchNbgRates().catch(() => null),
  ]);

  const breakdown = computeShippingGelBreakdown(
    { originCountry, weight },
    tariffs,
    nbgRates
  );
  if (breakdown) {
    return {
      shippingAmount: breakdown.amountGel,
      shippingFormula: breakdown.formula,
    };
  }

  const lower = originCountry?.trim().toLowerCase() ?? '';
  if (!lower) {
    return { error: 'წონისთვის ქვეყანა განისაზღვრული არ არის' };
  }
  const tariffCountry = FORM_TO_TARIFF_COUNTRY[lower] ?? lower.toUpperCase();
  const tariff = await prisma.tariff.findFirst({
    where: {
      originCountry: tariffCountry,
      destinationCountry: 'GE',
      isActive: true,
      minWeight: { lte: weight },
      OR: [{ maxWeight: null }, { maxWeight: { gte: weight } }],
    },
    orderBy: { minWeight: 'desc' },
  });
  if (!tariff) {
    return {
      error:
        'ამ ქვეყნის ტარიფი ვერ მოიძებნა. გთხოვთ შეამოწმოთ ტარიფები.',
    };
  }
  const amount = Math.round(weight * tariff.pricePerKg * 100) / 100;
  const currency = (
    tariff.currency ||
    CURRENCY_BY_ORIGIN_ISO[tariffCountry] ||
    'GEL'
  ).toUpperCase();
  const nbg = nbgRates ?? (await fetchNbgRates().catch(() => null));
  const converted =
    nbg && currency ? convertToGel(nbg, amount, currency) : null;
  const shippingAmount =
    converted != null ? Math.round(converted * 100) / 100 : amount;
  return { shippingAmount, shippingFormula: null };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT') {
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

    if (
      data.weight !== undefined &&
      parcel.status !== 'arrived' &&
      parcel.status !== 'in_warehouse'
    ) {
      return NextResponse.json(
        {
          error:
            'წონის რედაქტირება ხელმისაწვდომია მხოლოდ «საწყობში» ან «ჩამოსული» სტატუსის ამანათებზე',
        },
        { status: 400 }
      );
    }

    let shippingPatch: {
      shippingAmount: number | null;
      shippingFormula: string | null;
    } | null = null;

    if (data.weight !== undefined) {
      if (data.weight === null) {
        shippingPatch = { shippingAmount: null, shippingFormula: null };
      } else {
        const resolved = await resolveShippingAfterWeightChange(
          data.weight,
          parcel.originCountry
        );
        if ('error' in resolved) {
          return NextResponse.json({ error: resolved.error }, { status: 400 });
        }
        shippingPatch = {
          shippingAmount: resolved.shippingAmount,
          shippingFormula: resolved.shippingFormula,
        };
      }
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
          ...(data.weight !== undefined ? { weight: data.weight } : {}),
          ...(shippingPatch
            ? { shippingAmount: shippingPatch.shippingAmount }
            : {}),
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

    if (statusChanged && data.status !== undefined) {
      void notifyParcelOwnerStatusSms({
        parcelId: id,
        previousStatus: parcel.status,
        newStatus: data.status,
        trackingNumber: updatedParcel.trackingNumber,
        ownerPhone: updatedParcel.user.phone,
        originCountry: parcel.originCountry,
      });
    }

    return NextResponse.json(
      {
        message: 'განახლდა',
        parcel: {
          ...updatedParcel,
          createdAt: new Date(updatedParcel.createdAt).toLocaleDateString('ka-GE'),
          ...(shippingPatch
            ? {
                shippingAmount: shippingPatch.shippingAmount,
                shippingFormula: shippingPatch.shippingFormula,
              }
            : {}),
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
