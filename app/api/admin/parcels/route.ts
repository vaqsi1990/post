import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { utapi } from '@/lib/uploadthing';

export const dynamic = 'force-dynamic';

const allowedStatuses = ['pending', 'in_transit', 'arrived', 'region', 'delivered', 'cancelled'] as const;

const updateParcelStatusSchema = z.object({
  status: z.enum(allowedStatuses),
});

const ORIGIN_COUNTRY_CODES = ['uk', 'us', 'cn', 'it', 'gr', 'es', 'fr', 'de', 'tr'] as const;

const FORM_TO_TARIFF_COUNTRY: Record<string, string> = {
  uk: 'GB',
  us: 'US',
  cn: 'CN',
  it: 'IT',
  gr: 'GR',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  tr: 'TR',
};

const createParcelSchema = z.object({
  userEmail: z.string().email('User email is invalid'),
  customerName: z.string().min(1, 'Customer name is required'),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  price: z.number().min(0, 'Item value is required'),
  onlineShop: z.string().min(1, 'Online shop is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  originCountry: z.enum(ORIGIN_COUNTRY_CODES, { message: 'Origin country is required' }),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  comment: z.string().optional(),
  weight: z.number().min(0.001, 'Weight is required'),
  description: z.string().min(1, 'Description is required'),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPE = 'application/pdf';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  if (!allowedStatuses.includes(status as any)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const parcels = await prisma.parcel.findMany({
    where: { status: status as string },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          address: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      parcels: parcels.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt).toLocaleDateString('ka-GE'),
      })),
    },
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

  if (!session || session.user.role !== 'ADMIN') {
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

    const price = parseFloat(priceStr.replace(',', '.'));
    const quantity = parseInt(quantityStr, 10);
    const weight = weightStr ? parseFloat(weightStr.replace(',', '.')) : NaN;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }
    if (file.type !== ALLOWED_TYPE) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
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
      quantity,
      originCountry: originCountry || undefined,
      city: city || undefined,
      address: address || undefined,
      phone: phone || undefined,
      comment: comment || undefined,
      weight: Number.isNaN(weight) ? undefined : weight,
      description,
    });

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
    const shippingAmount = Math.round(parsed.weight * tariff.pricePerKg * 100) / 100;

    let user = await prisma.user.findUnique({
      where: { email: parsed.userEmail.trim().toLowerCase() },
      select: { id: true, phone: true },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const personalIdNumber = `AUTO-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
      const created = await prisma.user.create({
        data: {
          email: parsed.userEmail.trim().toLowerCase(),
          password: randomPassword,
          personalIdNumber,
          phone: parsed.phone || undefined,
          city: parsed.city || undefined,
          address: parsed.address || undefined,
        },
        select: { id: true, phone: true },
      });
      user = created;
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

    const uploadResult = await utapi.uploadFiles(file);

    if (uploadResult.error || !uploadResult.data?.url) {
      console.error('UploadThing error (admin parcel PDF):', uploadResult.error);
      return NextResponse.json(
        { error: 'Error while uploading file' },
        { status: 500 }
      );
    }

    const fileUrl = uploadResult.data.url;

    const parcel = await prisma.parcel.create({
      data: {
        userId: user.id,
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

