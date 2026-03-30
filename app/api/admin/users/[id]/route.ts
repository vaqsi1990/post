import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';
import { UserRole } from '../../../../../app/generated/prisma/enums';
import { ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { adminUpdateUserSchema } from '../../../../../lib/validations';
import { normalizePhone } from '../../../../../lib/sms';
import { Prisma } from '../../../../../app/generated/prisma/client';

const EMPLOYEE_COUNTRIES = ['GB', 'US', 'CN', 'IT', 'GR', 'ES', 'FR', 'DE', 'TR'] as const;
type EmployeeCountry = (typeof EMPLOYEE_COUNTRIES)[number];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [user, addresses, recentParcels, parcelsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          phoneVerified: true,
          personalIdNumber: true,
          city: true,
          address: true,
          postalIndex: true,
          balance: true,
          roomNumber: true,
          role: true,
          employeeCountry: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.address.findMany({
        where: { userId: id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          type: true,
          country: true,
          city: true,
          street: true,
          building: true,
          apartment: true,
          postalCode: true,
          isDefault: true,
          createdAt: true,
        },
      }),
      prisma.parcel.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          price: true,
          shippingAmount: true,
          currency: true,
          weight: true,
          originCountry: true,
          createdAt: true,
        },
      }),
      prisma.parcel.count({ where: { userId: id } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user,
        addresses,
        parcels: recentParcels,
        parcelsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'შეცდომა მომხმარებლის დეტალების წამოღებისას' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'თქვენ ვერ წაშლით საკუთარ თავს' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'მომხმარებელი წარმატებით წაიშალა' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'მომხმარებლის წაშლისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = adminUpdateUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        personalIdNumber: true,
        roomNumber: true,
        role: true,
        employeeCountry: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'მომხმარებელი ვერ მოიძებნა' }, { status: 404 });
    }

    const nextRole = data.role ? (data.role as UserRole) : existingUser.role;
    const employeeCountryRaw =
      data.employeeCountry === undefined
        ? existingUser.employeeCountry
        : (data.employeeCountry as EmployeeCountry | null);

    if (
      nextRole === UserRole.EMPLOYEE &&
      (!employeeCountryRaw || !EMPLOYEE_COUNTRIES.includes(employeeCountryRaw as EmployeeCountry))
    ) {
      return NextResponse.json(
        { error: 'თანამშრომლისთვის აირჩიეთ ვალიდური ქვეყანა' },
        { status: 400 }
      );
    }

    // prevent admin from changing own role (but allow updating other fields)
    if (data.role && id === session.user.id && nextRole !== existingUser.role) {
      return NextResponse.json(
        { error: 'საკუთარი როლის შეცვლა ვერ მოხერხდება' },
        { status: 400 }
      );
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (email !== existingUser.email) {
        const clash = await prisma.user.findUnique({ where: { email } });
        if (clash) {
          return NextResponse.json({ error: 'ეს ელ-ფოსტა უკვე გამოყენებულია' }, { status: 400 });
        }
      }
      updateData.email = email;
    }

    if (data.personalIdNumber !== undefined) {
      const pid = data.personalIdNumber.trim();
      if (pid !== existingUser.personalIdNumber) {
        const clash = await prisma.user.findFirst({ where: { personalIdNumber: pid } });
        if (clash) {
          return NextResponse.json({ error: 'ეს პირადი ნომერი უკვე გამოყენებულია' }, { status: 400 });
        }
      }
      updateData.personalIdNumber = pid;
    }

    if (data.phone !== undefined) {
      const phoneRaw = (data.phone ?? '').trim();
      let phone: string | null = null;
      if (phoneRaw.length >= 9) {
        const normalized = normalizePhone(phoneRaw);
        if (normalized !== existingUser.phone) {
          const clash = await prisma.user.findUnique({ where: { phone: normalized } });
          if (clash) {
            return NextResponse.json({ error: 'ეს ტელეფონის ნომერი უკვე გამოყენებულია' }, { status: 400 });
          }
        }
        phone = normalized;
      }
      updateData.phone = phone;
    }

    if (data.password !== undefined) {
      const pass = typeof data.password === 'string' ? data.password.trim() : '';
      if (pass) {
        updateData.password = await bcrypt.hash(pass, 10);
      }
    }

    if (data.firstName !== undefined) {
      const v = (data.firstName ?? '').trim();
      updateData.firstName = v ? v : null;
    }
    if (data.lastName !== undefined) {
      const v = (data.lastName ?? '').trim();
      updateData.lastName = v ? v : null;
    }
    if (data.city !== undefined) {
      const v = (data.city ?? '').trim();
      updateData.city = v ? v : null;
    }
    if (data.address !== undefined) {
      const v = (data.address ?? '').trim();
      updateData.address = v ? v : null;
    }
    if (data.postalIndex !== undefined) {
      const v = (data.postalIndex ?? '').trim();
      updateData.postalIndex = v ? v : null;
    }

    if (data.balance !== undefined) {
      updateData.balance = data.balance;
    }

    if (data.roomNumber !== undefined) {
      const v = (data.roomNumber ?? '').trim();
      const room = v ? v : null;
      if (room && room !== existingUser.roomNumber) {
        const clash = await prisma.user.findFirst({
          where: {
            roomNumber: room,
            NOT: { id },
          },
          select: { id: true },
        });
        if (clash) {
          return NextResponse.json({ error: 'ეს PO უკვე გამოყენებულია' }, { status: 400 });
        }
      }
      updateData.roomNumber = room;
    }

    if (data.phoneVerified !== undefined) {
      updateData.phoneVerified = data.phoneVerified;
    }

    if (data.role !== undefined || data.employeeCountry !== undefined) {
      updateData.role = nextRole;
      updateData.employeeCountry =
        nextRole === UserRole.EMPLOYEE ? (employeeCountryRaw as EmployeeCountry) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'ცვლილება არ არის' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneVerified: true,
        personalIdNumber: true,
        city: true,
        address: true,
        postalIndex: true,
        balance: true,
        roomNumber: true,
        role: true,
        employeeCountry: true,
      },
    });

    return NextResponse.json(
      { message: 'მომხმარებელი წარმატებით განახლდა', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join('; ');
      return NextResponse.json(
        { error: `ვალიდაცია: ${message}`, details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'მომხმარებლის განახლებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
