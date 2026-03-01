import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'მიმდინარე პაროლი აუცილებელია'),
  newPassword: z.string().min(6, 'ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      phoneVerified: true,
      personalIdNumber: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      phoneVerified: user.phoneVerified,
      personalIdNumber: user.personalIdNumber,
      createdAt: new Date(user.createdAt).toISOString(),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.newPassword != null) {
      const data = changePasswordSchema.parse({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });
      if (!user) {
        return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'მიმდინარე პაროლი არასწორია' },
          { status: 400 }
        );
      }
      const hashed = await bcrypt.hash(data.newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      });
      return NextResponse.json({ message: 'პაროლი წარმატებით შეიცვალა' });
    }

    const data = updateProfileSchema.parse(body);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName || null }),
        ...(data.lastName !== undefined && { lastName: data.lastName || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
    });
    return NextResponse.json({ message: 'პროფილი განახლდა' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('Settings update error:', err);
    return NextResponse.json(
      { error: 'განახლებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
