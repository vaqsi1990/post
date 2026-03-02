import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const tariffs = await prisma.tariff.findMany({
      orderBy: [{ isActive: 'desc' }, { originCountry: 'asc' }, { minWeight: 'asc' }],
    });
    return NextResponse.json(
      {
        tariffs: tariffs.map((t) => ({
          ...t,
          currency: t.currency || 'GEL',
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
    const tariff = await prisma.tariff.create({
      data: {
        originCountry: data.originCountry,
        destinationCountry: data.destinationCountry,
        minWeight: data.minWeight,
        maxWeight: data.maxWeight ?? null,
        pricePerKg: data.pricePerKg,
        currency: data.currency,
        isActive: data.isActive ?? true,
      },
    });
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
        currency: data.currency,
        isActive: data.isActive ?? true,
      },
    });

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

