import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import prisma from '../../../../lib/prisma';
import { registerApiSchema } from '../../../../lib/validations';
import { normalizePhone } from '../../../../lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod (API schema doesn't include confirmPassword)
    const validatedData = registerApiSchema.parse(body);

    // Verify OTP for phone
    const normalizedPhone = normalizePhone(validatedData.phone);
    const otpRecord = await prisma.phoneOtp.findFirst({
      where: { phone: normalizedPhone, code: validatedData.otpCode },
    });
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'არასწორი ან ვადაგასული კოდი' },
        { status: 400 }
      );
    }
    if (new Date() > otpRecord.expiresAt) {
      await prisma.phoneOtp.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return NextResponse.json(
        { error: 'კოდის ვადა გავიდა. გთხოვთ მოითხოვოთ ახალი.' },
        { status: 400 }
      );
    }
    await prisma.phoneOtp.delete({ where: { id: otpRecord.id } });

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'ეს ელფოსტა უკვე გამოყენებულია' },
        { status: 400 }
      );
    }

    // Check if user already exists by phone (unique per normalized number)
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'ეს ტელეფონის ნომერი უკვე გამოყენებულია' },
        { status: 400 }
      );
    }

    // Check if user already exists by personal ID number
    const existingUserByIdNumber = await prisma.user.findFirst({
      where: { personalIdNumber: validatedData.personalIdNumber },
    });

    if (existingUserByIdNumber) {
      return NextResponse.json(
        { error: 'ეს პირადობის ნომერი უკვე გამოყენებულია' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user (phone verified via OTP)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: normalizedPhone,
        phoneVerified: true,
        personalIdNumber: validatedData.personalIdNumber,
        city: validatedData.city,
        address: validatedData.address,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Create default shipping address from registration (city + address)
    await prisma.address.create({
      data: {
        userId: user.id,
        type: 'shipping',
        country: 'GE',
        city: validatedData.city,
        street: validatedData.address,
        isDefault: true,
      },
    });

    return NextResponse.json(
      {
        message: 'რეგისტრაცია წარმატებით დასრულდა',
        user,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Zod validation errors
    if (error instanceof ZodError) {
      // Format errors for better display
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      // Create a detailed error message
        const errorMessages = formattedErrors.map((err: { field: string; message: string; code: string }) => {
        const fieldName = err.field === 'email' ? 'ელფოსტა' :
                         err.field === 'password' ? 'პაროლი' :
                         err.field === 'confirmPassword' ? 'პაროლის დამოწმება' :
                         err.field === 'personalIdNumber' ? 'პირადობის ნომერი' :
                         err.field === 'firstName' ? 'სახელი' :
                         err.field === 'lastName' ? 'გვარი' :
                         err.field === 'phone' ? 'ტელეფონი' :
                         err.field === 'otpCode' ? 'სმს კოდი' :
                         err.field === 'city' ? 'ქალაქი' :
                         err.field === 'address' ? 'მისამართი' :
                         err.field;
        return `${fieldName}: ${err.message}`;
      }).join('; ');

      return NextResponse.json(
        {
          error: `ვალიდაციის შეცდომები: ${errorMessages}`,
          details: formattedErrors,
          rawErrors: error.issues,
        },
        { status: 400 }
      );
    }

    // Other errors
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'რეგისტრაციისას მოხდა შეცდომა',
        message: error instanceof Error ? error.message : 'უცნობი შეცდომა',
      },
      { status: 500 }
    );
  }
}
