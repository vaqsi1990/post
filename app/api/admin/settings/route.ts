import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

const updateAdminSettingsSchema = z
  .object({
    email: z.string().email('არასწორი ელფოსტა').optional(),
    firstName: z.string().min(1, 'სახელი აუცილებელია').optional(),
    lastName: z.string().min(1, 'გვარი აუცილებელია').optional(),
    city: z.string().max(200).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    personalIdNumber: z.string().min(1, 'პირადი ნომერი აუცილებელია').max(50).optional(),
    currentPassword: z.string().min(1, 'მიმდინარე პაროლი აუცილებელია').optional(),
    newPassword: z.string().min(6, 'ახალი პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო').optional(),
    confirmNewPassword: z.string().min(1, 'გაიმეორეთ ახალი პაროლი').optional(),
  })
  .refine(
    (data) => {
      const wantsPasswordChange = !!data.newPassword || !!data.confirmNewPassword;
      if (!wantsPasswordChange) return true;
      return data.newPassword === data.confirmNewPassword;
    },
    { message: 'პაროლები არ ემთხვევა', path: ['confirmNewPassword'] }
  )
  .refine(
    (data) => {
      const wantsPasswordChange = !!data.newPassword || !!data.confirmNewPassword;
      if (!wantsPasswordChange) return true;
      return !!data.currentPassword;
    },
    { message: 'მიმდინარე პაროლი აუცილებელია', path: ['currentPassword'] }
  )
  .refine(
    (data) => {
      const wantsEmailChange = typeof data.email === 'string';
      if (!wantsEmailChange) return true;
      // require current password for email change as well
      return !!data.currentPassword;
    },
    { message: 'ელფოსტის შეცვლაზე მიმდინარე პაროლი აუცილებელია', path: ['currentPassword'] }
  );

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body: unknown = await request.json();
    const data = updateAdminSettingsSchema.parse(body);

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true, personalIdNumber: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (data.currentPassword) {
      const ok = await bcrypt.compare(data.currentPassword, currentUser.password);
      if (!ok) {
        return NextResponse.json(
          { error: 'მიმდინარე პაროლი არასწორია', field: 'currentPassword' },
          { status: 400 }
        );
      }
    }

    // Email uniqueness check (if changed)
    if (data.email && data.email !== currentUser.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json(
          { error: 'ეს ელფოსტა უკვე გამოყენებულია', field: 'email' },
          { status: 400 }
        );
      }
    }

    // Personal ID number uniqueness check (if changed)
    if (
      data.personalIdNumber != null &&
      data.personalIdNumber !== (currentUser.personalIdNumber ?? '')
    ) {
      const existing = await prisma.user.findUnique({
        where: { personalIdNumber: data.personalIdNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'ეს პირადი ნომერი უკვე გამოყენებულია', field: 'personalIdNumber' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
      city?: string | null;
      address?: string | null;
      personalIdNumber?: string;
      password?: string;
    } = {};

    if (typeof data.email === 'string') updateData.email = data.email;
    if (typeof data.firstName === 'string') updateData.firstName = data.firstName;
    if (typeof data.lastName === 'string') updateData.lastName = data.lastName;
    if (data.city !== undefined) updateData.city = data.city ?? null;
    if (data.address !== undefined) updateData.address = data.address ?? null;
    if (typeof data.personalIdNumber === 'string') updateData.personalIdNumber = data.personalIdNumber;

    if (data.newPassword) {
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'პარამეტრები წარმატებით განახლდა',
        user: updated,
        requiresReauth: !!data.newPassword || (data.email && data.email !== currentUser.email),
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: err.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
          rawErrors: err.issues,
        },
        { status: 400 }
      );
    }

    console.error('Admin settings update error:', err);
    return NextResponse.json({ error: 'შეცდომა განახლებისას' }, { status: 500 });
  }
}

