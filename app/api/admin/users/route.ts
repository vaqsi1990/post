import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { authOptions } from '../../../../lib/auth';
import { formatDateDMY } from '../../../../lib/formatDate';
import prisma from '../../../../lib/prisma';
import { adminCreateUserSchema } from '../../../../lib/validations';
import { normalizePhone } from '../../../../lib/sms';
import {
  generateNextRoomNumber,
  withRetryOnDuplicateRoomNumber,
} from '../../../../lib/roomNumber';
import { cachedAdmin, AdminCacheTags } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

export async function GET(request: NextRequest) {
  const t0 = Date.now();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const pageRaw = url.searchParams.get('page') ?? '1';
    const pageSizeRaw = url.searchParams.get('pageSize') ?? url.searchParams.get('take') ?? '50';

    const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(pageSizeRaw, 10) || 50));
    const skip = (page - 1) * pageSize;

    // IMPORTANT: use a stable string key (no object params) so cache hits reliably.
    const cacheParams = `role=${session.user.role}|page=${page}|pageSize=${pageSize}`;

    const users = await cachedAdmin(
      'users:list:v2',
      cacheParams,
      async () => {
        return await prisma.user.findMany({
          skip,
          take: pageSize,
          // Add id tie-breaker to keep pagination stable when createdAt collisions happen.
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            address: true,
            role: true,
            employeeCountry: true,
            createdAt: true,
            roomNumber: true,
          },
        });
      },
      { ttlSeconds: 60, tags: [AdminCacheTags.users] },
    );

    return NextResponse.json(
      {
        users,
        page,
        pageSize,
        nextPage: users.length === pageSize ? page + 1 : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'შეცდომა მონაცემების წამოღებისას' },
      { status: 500 }
    );
  } finally {
    if (process.env.REQUEST_TIMING_DEBUG === '1') {
      console.log('[timing]', 'GET /api/admin/users', { ms: Date.now() - t0 });
    }
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = adminCreateUserSchema.parse(body);

    const email = validatedData.email.trim().toLowerCase();
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'ეს ელ-ფოსტა უკვე გამოყენებულია' },
        { status: 400 }
      );
    }

    const existingByIdNumber = await prisma.user.findFirst({
      where: { personalIdNumber: validatedData.personalIdNumber },
    });
    if (existingByIdNumber) {
      return NextResponse.json(
        { error: 'ეს პირადი ნომერი უკვე გამოყენებულია' },
        { status: 400 }
      );
    }

    const phoneRaw = validatedData.phone?.trim() ?? '';
    let phone: string | null = null;
    if (phoneRaw.length >= 9) {
      const normalizedPhone = normalizePhone(phoneRaw);
      const existingByPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { error: 'ეს ტელეფონის ნომერი უკვე გამოყენებულია' },
          { status: 400 }
        );
      }
      phone = normalizedPhone;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await withRetryOnDuplicateRoomNumber(async () => {
      const roomNumber = await generateNextRoomNumber();
      return prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: validatedData.firstName?.trim() || null,
          lastName: validatedData.lastName?.trim() || null,
          phone,
          phoneVerified: false,
          personalIdNumber: validatedData.personalIdNumber,
          city: validatedData.city?.trim() || null,
          address: validatedData.address?.trim() || null,
          postalIndex: validatedData.postalIndex?.trim() || null,
          role: validatedData.role ?? 'USER',
          roomNumber,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          roomNumber: true,
        },
      });
    });

    const city = validatedData.city?.trim();
    const address = validatedData.address?.trim();
    if (user.id && city && address) {
      const postal = validatedData.postalIndex?.trim() || null;
      await prisma.address.create({
        data: {
          userId: user.id,
          type: 'shipping',
          country: 'GE',
          city,
          street: address,
          postalCode: postal,
          isDefault: true,
        },
      });
    }

    // Best-effort: keep admin lists/counters fresh.
    void invalidateCacheTags([AdminCacheTags.users, AdminCacheTags.counts]);

    return NextResponse.json(
      {
        message: 'მომხმარებელი წარმატებით დარეგისტრირდა',
        user: {
          ...user,
          createdAt: formatDateDMY(user.createdAt),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join('; ');
      return NextResponse.json(
        { error: `ვალიდაცია: ${message}`, details: error.issues },
        { status: 400 }
      );
    }
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { error: 'მომხმარებლის შექმნისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
