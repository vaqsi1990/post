import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidateActiveTariffsCache } from '@/lib/cachedTariffs';
import { AdminCacheTags, cachedAdmin } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

// All tariff data is stored only in Prisma (PostgreSQL). No other storage.

export const dynamic = 'force-dynamic';

const CURRENCY_BY_ORIGIN_ISO: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  CN: 'USD',
  GR: 'EUR',
  FR: 'EUR',
  TR: 'USD',
};

const createTariffSchema = z.object({
  originCountry: z.string().min(1),
  destinationCountry: z.string().min(1),
  minWeight: z.number().min(0),
  maxWeight: z.number().min(0).nullable().optional(),
  pricePerKg: z.number().min(0),
  currency: z.string().min(1),
  isActive: z.boolean().optional(),
});

const updateTariffSchema = createTariffSchema.extend({
  id: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (session.user.role !== 'ADMIN') return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { ok: true as const };
}

async function requireAdminOrEmployeeRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (session.user.role !== 'ADMIN' && session.user.role !== 'EMPLOYEE' && session.user.role !== 'SUPPORT') {
    return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true as const };
}

export async function GET() {
  const auth = await requireAdminOrEmployeeRead();
  if (!auth.ok) return auth.res;

  try {
    const tariffs = await cachedAdmin(
      'tariffs:list:v1',
      { role: 'ADMIN_READ' },
      async () => {
        return await prisma.tariff.findMany({
          orderBy: [{ isActive: 'desc' }, { originCountry: 'asc' }, { minWeight: 'asc' }],
        });
      },
      { ttlSeconds: 60, tags: [AdminCacheTags.tariffs] },
    );
    return NextResponse.json(
      {
        tariffs: tariffs.map((t) => ({
          ...t,
          currency:
            t.currency ||
            CURRENCY_BY_ORIGIN_ISO[t.originCountry?.toUpperCase?.() as string] ||
            'GEL',
        })),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (e) {
    console.error('Get tariffs error:', e);
    return NextResponse.json({ error: 'შეცდომა ტარიფების წამოღებისას' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const data = createTariffSchema.parse(body);
    const derivedCurrency =
      CURRENCY_BY_ORIGIN_ISO[data.originCountry.toUpperCase()] ?? data.currency;
    const tariff = await prisma.tariff.create({
      data: {
        originCountry: data.originCountry,
        destinationCountry: data.destinationCountry,
        minWeight: data.minWeight,
        maxWeight: data.maxWeight ?? null,
        pricePerKg: data.pricePerKg,
        currency: derivedCurrency,
        isActive: data.isActive ?? true,
      },
    });
    revalidateActiveTariffsCache();
    void invalidateCacheTags([AdminCacheTags.tariffs]);
    return NextResponse.json({ message: 'ტარიფი დაემატა', tariff }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: e.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('Create tariff error:', e);
    return NextResponse.json({ error: 'ტარიფის დამატება ვერ მოხერხდა' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const data = updateTariffSchema.parse(body);
    const derivedCurrency =
      CURRENCY_BY_ORIGIN_ISO[data.originCountry.toUpperCase()] ?? data.currency;

    if (data.maxWeight !== undefined && data.maxWeight !== null && data.maxWeight < data.minWeight) {
      return NextResponse.json({ error: 'Max kg უნდა იყოს >= Min kg ან ცარიელი (∞)' }, { status: 400 });
    }

    const tariff = await prisma.tariff.update({
      where: { id: data.id },
      data: {
        originCountry: data.originCountry,
        destinationCountry: data.destinationCountry,
        minWeight: data.minWeight,
        maxWeight: data.maxWeight ?? null,
        pricePerKg: data.pricePerKg,
        currency: derivedCurrency,
        isActive: data.isActive ?? true,
      },
    });

    revalidateActiveTariffsCache();
    void invalidateCacheTags([AdminCacheTags.tariffs]);
    return NextResponse.json({ message: 'შენახულია', tariff }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: e.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('Update tariff error:', e);
    return NextResponse.json({ error: 'შენახვა ვერ მოხერხდა' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const { id } = z.object({ id: z.string().min(1) }).parse(body);
    await prisma.tariff.delete({ where: { id } });
    revalidateActiveTariffsCache();
    void invalidateCacheTags([AdminCacheTags.tariffs]);
    return NextResponse.json({ message: 'ტარიფი წაიშალა' }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ვალიდაციის შეცდომა', details: e.issues },
        { status: 400 }
      );
    }
    console.error('Delete tariff error:', e);
    return NextResponse.json({ error: 'წაშლა ვერ მოხერხდა' }, { status: 500 });
  }
}

