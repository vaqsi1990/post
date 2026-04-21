import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import type { Prisma } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';
import {
  ADMIN_PARCEL_PAGE_SIZE,
  adminParcelsOrderBy,
  parseAdminParcelPage,
} from '@/lib/adminParcelList';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { UNKNOWN_COUNTRY_KEY, parcelOriginKey } from '@/lib/parcelOriginKey';
import { recordParcelTrackingEvent } from '@/lib/parcelTrackingLog';
import { utapi } from '@/lib/uploadthing';
import { adminParcelInclude } from '@/lib/adminParcelInclude';
import { convertToGel, fetchNbgRates } from '@/lib/nbgRates';
import { computeShippingGelBreakdown } from '@/lib/parcelShippingGel';
import { cachedAdmin, AdminCacheTags, adminParcelsTag } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';
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

function isAllowedStatus(status: string): status is (typeof allowedStatuses)[number] {
  return (allowedStatuses as readonly string[]).includes(status);
}

const ORIGIN_COUNTRY_CODES = ['uk', 'us', 'cn', 'gr', 'fr', 'tr'] as const;

const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  gr: 'GR',
  fr: 'FR',
  tr: 'TR',
};

const CURRENCY_BY_ORIGIN_ISO: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CN: 'USD',
  GR: 'EUR',
  FR: 'EUR',
  TR: 'USD',
};

const optionalNumberFromString = (emptyMessage: string) =>
  z.preprocess(
    (v) => {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        return Number(trimmed.replace(',', '.'));
      }
      return v;
    },
    z.number({ message: emptyMessage }),
  ).optional();

const optionalIntFromString = (emptyMessage: string) =>
  z.preprocess(
    (v) => {
      if (typeof v === 'string') {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        return parseInt(trimmed, 10);
      }
      return v;
    },
    z.number({ message: emptyMessage }).int(),
  ).optional();

const createParcelSchema = z.object({
  userEmail: z.string().email('User email is invalid'),
  customerName: z.string().min(1, 'Customer name is required'),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  price: z.number().min(0, 'Item value is required'),
  onlineShop: z.string().min(1, 'Online shop is required'),
  quantity: optionalIntFromString('Quantity is invalid').refine(
    (v) => v === undefined || v >= 1,
    'Quantity is invalid',
  ),
  originCountry: z.enum(ORIGIN_COUNTRY_CODES, { message: 'Origin country is required' }),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  comment: z.string().optional(),
  weight: optionalNumberFromString('Weight is invalid').refine(
    (v) => v === undefined || v >= 0.001,
    'Weight is invalid',
  ),
  description: z.string().min(1, 'Description is required'),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPE = 'application/pdf';

function isParcelStaff(role: string | undefined): role is 'ADMIN' | 'EMPLOYEE' | 'SUPPORT' {
  return role === 'ADMIN' || role === 'EMPLOYEE' || role === 'SUPPORT';
}

function countryFilterWhere(country: string | null): Prisma.ParcelWhereInput | undefined {
  if (!country) return undefined;
  if (country === UNKNOWN_COUNTRY_KEY) {
    return { OR: [{ originCountry: null }, { originCountry: '' }] };
  }
  return { originCountry: { equals: country, mode: 'insensitive' } };
}

export async function GET(request: NextRequest) {
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

  const data = await cachedAdmin(
    'parcels:list:v1',
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
            shippingAmount:
              breakdown != null ? breakdown.amountGel : p.shippingAmount,
            shippingFormula:
              breakdown != null ? breakdown.formula : null,
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

  return NextResponse.json(
    data,
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !isParcelStaff(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const userEmail = formData.get('userEmail')?.toString().trim() ?? '';
    const customerName = formData.get('customerName')?.toString().trim() ?? '';
    const trackingNumber = formData.get('trackingNumber')?.toString().trim() ?? '';
    const priceStr = formData.get('price')?.toString().trim() ?? '';
    const onlineShop = formData.get('onlineShop')?.toString().trim() ?? '';
    const quantityStr = formData.get('quantity')?.toString().trim() ?? '';
    const originCountry = formData.get('originCountry')?.toString().trim() ?? '';
    const city = formData.get('city')?.toString().trim() ?? '';
    const address = formData.get('address')?.toString().trim() ?? '';
    const phone = formData.get('phone')?.toString().trim() ?? '';
    const comment = formData.get('comment')?.toString().trim() ?? '';
    const weightStr = formData.get('weight')?.toString().trim() ?? '';
    const description = formData.get('description')?.toString().trim() ?? '';
    const file = formData.get('file') as File | null;

    if (!priceStr) {
      return NextResponse.json(
        { error: 'Item value is required' },
        { status: 400 }
      );
    }

    const price = parseFloat(priceStr.replace(',', '.'));
    const quantity = quantityStr ? parseInt(quantityStr, 10) : NaN;
    const weight = weightStr ? parseFloat(weightStr.replace(',', '.')) : NaN;

    const hasFile = !!file && file.size > 0;
    if (!Number.isNaN(price) && price >= 296 && !hasFile) {
      return NextResponse.json(
        { error: '296 ლარიდან ინვოისის PDF ფაილი აუცილებელია' },
        { status: 400 }
      );
    }
    if (hasFile && file.type !== ALLOWED_TYPE) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    if (hasFile && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must not exceed 10 MB' },
        { status: 400 }
      );
    }

    const parsed = createParcelSchema.parse({
      userEmail,
      customerName,
      trackingNumber,
      price,
      onlineShop,
      quantity: Number.isNaN(quantity) ? undefined : quantity,
      originCountry: originCountry || undefined,
      city: city || undefined,
      address: address || undefined,
      phone: phone || undefined,
      comment: comment || undefined,
      weight: Number.isNaN(weight) ? undefined : weight,
      description,
    });

    if (session.user.role === 'EMPLOYEE') {
      const employee = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { employeeCountry: true },
      });
      const expectedTariffCountry = FORM_TO_TARIFF_COUNTRY[parsed.originCountry];
      if (
        !employee?.employeeCountry ||
        employee.employeeCountry !== expectedTariffCountry
      ) {
        return NextResponse.json(
          {
            error:
              'თქვენ მხოლოდ თქვენს ქვეყანაზე მიბმული ამანათის დამატება შეგიძლიათ. შეამოწმეთ პროფილი ან დაუკავშირდით ადმინს.',
          },
          { status: 403 }
        );
      }
    }

    let shippingAmount: number | null = null;
    if (parsed.weight != null) {
      const tariffCountry = FORM_TO_TARIFF_COUNTRY[parsed.originCountry];
      const tariff = await prisma.tariff.findFirst({
        where: {
          originCountry: tariffCountry,
          destinationCountry: 'GE',
          isActive: true,
          minWeight: { lte: parsed.weight },
          OR: [{ maxWeight: null }, { maxWeight: { gte: parsed.weight } }],
        },
        orderBy: { minWeight: 'desc' },
      });
      if (!tariff) {
        return NextResponse.json(
          { error: 'ამ ქვეყნის ტარიფი ვერ მოიძებნა. გთხოვთ შეამოწმოთ ტარიფები.' },
          { status: 400 }
        );
      }
      const amount = Math.round(parsed.weight * tariff.pricePerKg * 100) / 100;
      const currency =
        (tariff.currency || CURRENCY_BY_ORIGIN_ISO[tariffCountry] || 'GEL').toUpperCase();
      const nbgRates = await fetchNbgRates().catch(() => null);
      const converted =
        nbgRates && currency
          ? convertToGel(nbgRates, amount, currency)
          : null;
      shippingAmount =
        converted != null
          ? Math.round(converted * 100) / 100
          : amount;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.userEmail.trim().toLowerCase() },
      select: { id: true, phone: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'ელფოსტა უნდა ეკუთვნოდეს სისტემაში უკვე დარეგისტრირებულ მომხმარებელს.',
          errorCode: 'USER_EMAIL_NOT_REGISTERED',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.parcel.findUnique({
      where: { trackingNumber: parsed.trackingNumber.trim() },
    });

    if (existing) {
      if (existing.userId === user.id) {
        return NextResponse.json(
          { error: 'Parcel with this tracking number already exists for this user' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Parcel with this tracking number belongs to another user' },
        { status: 409 }
      );
    }

    let fileUrl: string | null = null;
    if (hasFile) {
      const uploadResult = await utapi.uploadFiles(file);

      if (uploadResult.error || !uploadResult.data?.url) {
        console.error('UploadThing error (admin parcel PDF):', uploadResult.error);
        return NextResponse.json(
          { error: 'Error while uploading file' },
          { status: 500 }
        );
      }

      fileUrl = uploadResult.data.url;
    }

    const parcel = await prisma.parcel.create({
      data: {
        userId: user.id,
        createdById: session.user.id,
        customerName: parsed.customerName.trim(),
        trackingNumber: parsed.trackingNumber.trim(),
        price: parsed.price,
        shippingAmount,
        onlineShop: parsed.onlineShop.trim(),
        quantity: parsed.quantity ?? 1,
        originCountry: parsed.originCountry,
        comment: parsed.comment?.trim() ?? null,
        weight: parsed.weight ?? null,
        description: parsed.description?.trim() ?? null,
        currency: 'GEL',
        filePath: fileUrl,
      },
    });

    await recordParcelTrackingEvent(prisma, parcel.id, parcel.status);

    void invalidateCacheTags([
      AdminCacheTags.parcels,
      AdminCacheTags.counts,
      adminParcelsTag('pending'),
      adminParcelsTag('in_warehouse'),
      adminParcelsTag('in_transit'),
      adminParcelsTag('arrived'),
      adminParcelsTag('region'),
      adminParcelsTag('delivered'),
      adminParcelsTag('stopped'),
    ]);

    return NextResponse.json(
      {
        message: 'Parcel created successfully',
        parcel: {
          id: parcel.id,
          trackingNumber: parcel.trackingNumber,
          status: parcel.status,
          createdAt: new Date(parcel.createdAt).toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }

    console.error('Admin create parcel error:', err);
    return NextResponse.json(
      { error: 'Error while creating parcel' },
      { status: 500 }
    );
  }
}

