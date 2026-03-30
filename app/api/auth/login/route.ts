import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '../../../../lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = loginSchema.parse(body);

    // Use NextAuth signIn (this will be handled by the client)
    // For server-side, we'll return the validated data
    return NextResponse.json(
      {
        message: 'ვალიდაცია წარმატებულია',
        email: validatedData.email,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Other errors
    console.error('Login validation error:', error);
    return NextResponse.json(
      { error: 'ვალიდაციისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
