import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { resolveTariffForParcel } from '../../../../lib/tariffLookup';
import { utapi } from '../../../../lib/uploadthing';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ALLOWED_TYPE = 'application/pdf';

const ORIGIN_COUNTRY_CODES = ['uk', 'us', 'cn', 'it', 'gr', 'es', 'fr', 'de', 'tr'] as const;

const createParcelSchema = z.object({
  customerName: z.string().min(1, 'მომხმარებლის სახელი აუცილებელია'),
  trackingNumber: z.string().min(1, 'თრექინგ კოდი აუცილებელია'),
  price: z.number().min(0, 'ნაყიდი ნივთის ღირებულება აუცილებელია'),
  onlineShop: z.string().min(1, 'ონლაინ მაღაზია აუცილებელია'),
  quantity: z.number().int().min(1, 'ამანათის რაოდენობა აუცილებელია'),
  originCountry: z.enum(ORIGIN_COUNTRY_CODES, { message: 'ქვეყანა აუცილებელია' }),
  comment: z.string().optional(),
  weight: z.number().min(0.001, 'წონა აუცილებელია და უნდა იყოს მეტი 0-ზე'),
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

    const price = parseFloat(priceStr.replace(',', '.'));
    const quantity = parseInt(quantityStr, 10);
    const weight = weightStr ? parseFloat(weightStr.replace(',', '.')) : NaN;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'PDF ფაილის ატვირთვა აუცილებელია' },
        { status: 400 },
      );
    }
    if (file.type !== ALLOWED_TYPE) {
      return NextResponse.json(
        { error: 'მხოლოდ PDF ფორმატია დაშვებული' },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ფაილის ზომა არ უნდა აღემატებოდეს 5 MB-ს' },
        { status: 400 },
      );
    }

    const parsed = createParcelSchema.parse({
      customerName,
      trackingNumber,
      price: Number.isNaN(price) ? undefined : price,
      onlineShop,
      quantity,
      originCountry: originCountry || undefined,
      comment: comment || undefined,
      weight: Number.isNaN(weight) ? undefined : weight,
      description,
    });

    const tariffs = await prisma.tariff.findMany({
      where: { isActive: true, destinationCountry: 'GE' },
      select: {
        originCountry: true,
        destinationCountry: true,
        minWeight: true,
        maxWeight: true,
        pricePerKg: true,
        isActive: true,
      },
    });
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
    const shippingAmount = resolved.shippingTotal;

    const userId = session.user.id;

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

    const uploadResult = await utapi.uploadFiles(file);

    if (uploadResult.error || !uploadResult.data?.url) {
      console.error('UploadThing error (parcel PDF):', uploadResult.error);
      return NextResponse.json(
        { error: 'ფაილის ატვირთვისას მოხდა შეცდომა' },
        { status: 500 },
      );
    }

    const fileUrl = uploadResult.data.url;

    const parcel = await prisma.parcel.create({
      data: {
        userId,
        customerName: parsed.customerName.trim(),
        trackingNumber: parsed.trackingNumber.trim(),
        price: parsed.price,
        shippingAmount,
        onlineShop: parsed.onlineShop.trim(),
        quantity: parsed.quantity,
        originCountry: parsed.originCountry,
        comment: parsed.comment?.trim() ?? null,
        weight: parsed.weight,
        description: parsed.description?.trim() ?? null,
        currency: 'GEL',
        filePath: fileUrl,
      },
    });

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
    console.error('Create parcel error:', err);
    return NextResponse.json(
      { error: 'ამანათის დამატებისას მოხდა შეცდომა' },
      { status: 500 },
    );
  }
}
