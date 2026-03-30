import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ORIGIN_CODES = ['uk', 'us', 'cn', 'it', 'gr', 'es', 'fr', 'de', 'tr'] as const;

function parseOptionalDate(v: unknown): Date | null {
  if (v == null || v === '') return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

const createReisSchema = z.object({
  name: z.string().trim().min(1, 'სახელი აუცილებელია'),
  originCountry: z.enum(ORIGIN_CODES),
  destinationCountry: z.string().trim().min(1).default('GE'),
  departureAt: z.preprocess(parseOptionalDate, z.date().nullable().optional()),
  arrivalAt: z.preprocess(parseOptionalDate, z.date().nullable().optional()),
  status: z.enum(['open', 'closed']).default('open'),
  notes: z.string().optional(),
});

const updateReisSchema = createReisSchema.extend({
  id: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true as const };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const reises = await prisma.reis.findMany({
      orderBy: [{ departureAt: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { parcels: true } } },
    });
    return NextResponse.json(
      { reises },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (e) {
    console.error('Get reises error:', e);
    return NextResponse.json({ error: 'შეცდომა რეისების წამოღებისას' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const data = createReisSchema.parse(body);
    const reis = await prisma.reis.create({
      data: {
        name: data.name,
        originCountry: data.originCountry,
        destinationCountry: data.destinationCountry,
        departureAt: data.departureAt ?? null,
        arrivalAt: data.arrivalAt ?? null,
        status: data.status,
        notes: data.notes?.trim() ? data.notes.trim() : null,
      },
    });
    return NextResponse.json({ message: 'რეისი დაემატა', reis }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: e.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 },
      );
    }
    console.error('Create reis error:', e);
    return NextResponse.json({ error: 'რეისის დამატება ვერ მოხერხდა' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const data = updateReisSchema.parse(body);

    const reis = await prisma.reis.update({
      where: { id: data.id },
      data: {
        name: data.name,
        originCountry: data.originCountry,
        destinationCountry: data.destinationCountry,
        departureAt: data.departureAt ?? null,
        arrivalAt: data.arrivalAt ?? null,
        status: data.status,
        notes: data.notes?.trim() ? data.notes.trim() : null,
      },
    });

    return NextResponse.json({ message: 'შენახულია', reis }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: e.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 },
      );
    }
    console.error('Update reis error:', e);
    return NextResponse.json({ error: 'შენახვა ვერ მოხერხდა' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();
    const { id } = z.object({ id: z.string().min(1) }).parse(body);
    await prisma.reis.delete({ where: { id } });
    return NextResponse.json({ message: 'რეისი წაიშალა' }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'ვალიდაციის შეცდომა', details: e.issues }, { status: 400 });
    }
    console.error('Delete reis error:', e);
    return NextResponse.json({ error: 'წაშლა ვერ მოხერხდა' }, { status: 500 });
  }
}
