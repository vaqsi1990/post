import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import prisma from '../../../../lib/prisma';
import { registerApiSchema } from '../../../../lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod (API schema doesn't include confirmPassword)
    const validatedData = registerApiSchema.parse(body);

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        personalIdNumber: validatedData.personalIdNumber,
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
