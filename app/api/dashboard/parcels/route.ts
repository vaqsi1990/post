import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { getCachedActiveTariffsForGeorgia } from '@/lib/cachedTariffs';
import { recordParcelTrackingEvent } from '../../../../lib/parcelTrackingLog';
import { resolveTariffForParcel } from '../../../../lib/tariffLookup';
import { utapi } from '../../../../lib/uploadthing';
import { convertToGel, fetchNbgRates } from '../../../../lib/nbgRates';
import { dashUserParcelsTag, dashUserParcelsStatusTag } from '@/lib/cache/dashboardCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

function isPrismaClientKnownRequestError(
  err: unknown,
): err is { code: string; meta?: { target?: string[] | string } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code?: unknown }).code === 'string'
  );
}

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPE = 'application/pdf';

const ORIGIN_COUNTRY_CODES = ['uk', 'us', 'cn', 'gr', 'fr', 'tr'] as const;

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
  customerName: z.string().min(1, 'მომხმარებლის სახელი აუცილებელია'),
  trackingNumber: z.string().min(1, 'თრექინგ კოდი აუცილებელია'),
  price: z.number().min(0, 'ნაყიდი ნივთის ღირებულება აუცილებელია'),
  onlineShop: z.string().min(1, 'ონლაინ მაღაზია აუცილებელია'),
  quantity: optionalIntFromString('ამანათის რაოდენობა არასწორია').refine(
    (v) => v === undefined || v >= 1,
    'ამანათის რაოდენობა არასწორია',
  ),
  originCountry: z.enum(ORIGIN_COUNTRY_CODES, { message: 'ქვეყანა აუცილებელია' }),
  comment: z.string().optional(),
  weight: optionalNumberFromString('წონა არასწორია').refine(
    (v) => v === undefined || v >= 0.001,
    'წონა არასწორია',
  ),
  description: z.string().min(1, 'აღწერა აუცილებელია'),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    const customerName = formData.get('customerName')?.toString().trim() ?? '';
    const trackingNumber = formData.get('trackingNumber')?.toString().trim() ?? '';
    const priceStr = formData.get('price')?.toString().trim() ?? '';
    const onlineShop = formData.get('onlineShop')?.toString().trim() ?? '';
    const quantityStr = formData.get('quantity')?.toString().trim() ?? '';
    const originCountry = formData.get('originCountry')?.toString().trim() ?? '';
    const comment = formData.get('comment')?.toString().trim() ?? '';
    const weightStr = formData.get('weight')?.toString().trim() ?? '';
    const description = formData.get('description')?.toString().trim() ?? '';
    const file = formData.get('file') as File | null;

    if (!priceStr) {
      return NextResponse.json(
        { error: 'ნაყიდი ნივთის ღირებულება აუცილებელია' },
        { status: 400 },
      );
    }

    const price = parseFloat(priceStr.replace(',', '.'));
    const quantity = quantityStr ? parseInt(quantityStr, 10) : NaN;
    const weight = weightStr ? parseFloat(weightStr.replace(',', '.')) : NaN;

    const hasFile = !!file && file.size > 0;
    if (!Number.isNaN(price) && price >= 296 && !hasFile) {
      return NextResponse.json(
        { error: '296 ლარიდან ინვოისის PDF ფაილი აუცილებელია' },
        { status: 400 },
      );
    }
    if (hasFile && file.type !== ALLOWED_TYPE) {
      return NextResponse.json({ error: 'მხოლოდ PDF ფორმატია დაშვებული' }, { status: 400 });
    }
    if (hasFile && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'ფაილის ზომა არ უნდა აღემატებოდეს 10 MB-ს' }, { status: 400 });
    }

    const parsed = createParcelSchema.parse({
      customerName,
      trackingNumber,
      price: Number.isNaN(price) ? undefined : price,
      onlineShop,
      quantity: Number.isNaN(quantity) ? undefined : quantity,
      originCountry: originCountry || undefined,
      comment: comment || undefined,
      weight: Number.isNaN(weight) ? undefined : weight,
      description,
    });

    let shippingAmount: number | null = null;
    if (parsed.weight != null) {
      const tariffs = await getCachedActiveTariffsForGeorgia();
      const resolved = resolveTariffForParcel(
        tariffs,
        parsed.originCountry,
        parsed.weight,
      );
      if (!resolved) {
        return NextResponse.json(
          { error: 'ამ ქვეყნის ტარიფი ვერ მოიძებნა. გთხოვთ დაუკავშირდეთ ადმინისტრაციას.' },
          { status: 400 },
        );
      }
      const nbgRates = await fetchNbgRates().catch(() => null);
      const converted =
        nbgRates && resolved.currency
          ? convertToGel(nbgRates, resolved.shippingTotal, resolved.currency)
          : null;
      shippingAmount =
        converted != null
          ? Math.round(converted * 100) / 100
          : resolved.shippingTotal;
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.parcel.findUnique({
      where: { trackingNumber: parsed.trackingNumber.trim() },
    });
    if (existing) {
      if (existing.userId === userId) {
        return NextResponse.json(
          { error: 'ამ თრექინგ კოდით ამანათი უკვე დამატებული გაქვთ' },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: 'ამ თრექინგ კოდით ამანათი სხვა მომხმარებელს ეკუთვნის' },
        { status: 409 },
      );
    }

    let fileUrl: string | null = null;
    if (hasFile) {
      const uploadResult = await utapi.uploadFiles(file);
      if (uploadResult.error || !uploadResult.data?.url) {
        console.error('UploadThing error (parcel PDF):', uploadResult.error);
        return NextResponse.json({ error: 'ფაილის ატვირთვისას მოხდა შეცდომა' }, { status: 500 });
      }
      fileUrl = uploadResult.data.url;
    }

    const parcel = await prisma.parcel.create({
      data: {
        user: { connect: { id: userId } },
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
        message: 'ამანათი წარმატებით დაემატა',
        parcel: {
          id: parcel.id,
          trackingNumber: parcel.trackingNumber,
          status: parcel.status,
          createdAt: new Date(parcel.createdAt).toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 },
      );
    }
    if (isPrismaClientKnownRequestError(err)) {
      // Prisma errors are opaque in Turbopack logs; print meta for debugging.
      try {
        console.error('Create parcel prisma error:', JSON.stringify(err, null, 2));
      } catch {
        console.error('Create parcel prisma error:', err);
      }
      const code = err.code;
      const target = err.meta?.target;
      if (code === 'P2011') {
        return NextResponse.json(
          {
            error:
              'ბაზის ველი სავალდებულოა (Null constraint violation). თუ ეს ეხება PDF-ს, გადაამოწმეთ რომ DB-ში `Parcel.filePath` nullable-ია.',
            details: { code, target },
          },
          { status: 500 },
        );
      }
    } else {
      console.error('Create parcel error:', err);
    }
    return NextResponse.json(
      { error: 'ამანათის დამატებისას მოხდა შეცდომა' },
      { status: 500 },
    );
  }
}
