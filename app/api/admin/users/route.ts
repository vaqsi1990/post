import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { adminCreateUserSchema } from '../../../../lib/validations';
import { normalizePhone } from '../../../../lib/sms';
import { generateNextRoomNumber } from '../../../../lib/roomNumber';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        address: true,
        role: true,
        createdAt: true,
        roomNumber: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'შეცდომა მონაცემების წამოღებისას' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
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
        { error: 'ეს ელფოსტა უკვე გამოყენებულია' },
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

    const roomNumber = await generateNextRoomNumber();

    const user = await prisma.user.create({
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

    const city = validatedData.city?.trim();
    const address = validatedData.address?.trim();
    if (user.id && city && address) {
      await prisma.address.create({
        data: {
          userId: user.id,
          type: 'shipping',
          country: 'GE',
          city,
          street: address,
          isDefault: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'მომხმარებელი წარმატებით დარეგისტრირდა',
        user: {
          ...user,
          createdAt: new Date(user.createdAt).toLocaleDateString('ka-GE'),
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
