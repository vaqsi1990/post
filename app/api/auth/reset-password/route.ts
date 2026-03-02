import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { normalizePhone } from '@/lib/sms';

const resetSchema = z.object({
  phone: z.string().min(9, 'შეიყვანეთ ტელეფონის ნომერი'),
  otpCode: z.string().length(4, 'კოდი უნდა იყოს 4 ციფრი').regex(/^\d{4}$/, 'მხოლოდ 4 ციფრი'),
  newPassword: z.string().min(6, 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = resetSchema.parse(body);

    const normalizedPhone = normalizePhone(data.phone);

    const otpRecord = await prisma.phoneOtp.findFirst({
      where: { phone: normalizedPhone, code: data.otpCode },
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

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'ამ ტელეფონის ნომრით მომხმარებელი ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: 'პაროლი წარმატებით შეიცვალა',
    });
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
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: 'პაროლის აღდგენისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
