import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSms, normalizePhone } from '@/lib/sms';

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 4;

function generateOtp(): string {
  const digits: number[] = [];
  const used = new Set<number>();
  while (digits.length < OTP_LENGTH) {
    const d = Math.floor(Math.random() * 10);
    if (!used.has(d)) {
      used.add(d);
      digits.push(d);
    }
  }
  return digits.join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!phone || phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json(
        { error: 'შეიყვანეთ ტელეფონის ნომერი' },
        { status: 400 }
      );
    }

    const normalized = normalizePhone(phone);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.phoneOtp.deleteMany({ where: { phone: normalized } });
    await prisma.phoneOtp.create({
      data: { phone: normalized, code, expiresAt },
    });

    const text = `თქვენი კოდი: ${code}`;
    const result = await sendSms(normalized, text);

    if (!result.ok) {
      await prisma.phoneOtp.deleteMany({ where: { phone: normalized } });
      return NextResponse.json(
        {
          error: 'SMS-ის გაგზავნა ვერ მოხერხდა',
          code: result.code,
          message: result.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: 'კოდი გაიგზავნა',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (e) {
    console.error('Send OTP error:', e);
    return NextResponse.json(
      { error: 'კოდის გაგზავნა ვერ მოხერხდა' },
      { status: 500 }
    );
  }
}
