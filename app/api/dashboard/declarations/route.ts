import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPE = 'application/pdf';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const firstName = formData.get('firstName')?.toString()?.trim();
    const lastName = formData.get('lastName')?.toString()?.trim();
    const trackingCode = formData.get('trackingCode')?.toString()?.trim();
    const priceStr = formData.get('price')?.toString()?.trim();
    const file = formData.get('file') as File | null;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'სახელი და გვარი აუცილებელია' },
        { status: 400 }
      );
    }
    if (!trackingCode) {
      return NextResponse.json(
        { error: 'თრექინგ კოდი აუცილებელია' },
        { status: 400 }
      );
    }
    const price = parseFloat(priceStr ?? '');
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'ფასი უნდა იყოს დადებითი რიცხვი' },
        { status: 400 }
      );
    }
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'PDF ფაილის ატვირთვა აუცილებელია' },
        { status: 400 }
      );
    }
    if (file.type !== ALLOWED_TYPE) {
      return NextResponse.json(
        { error: 'მხოლოდ PDF ფორმატია დაშვებული' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ფაილის ზომა არ უნდა აღემატებოდეს 5 MB-ს' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'declarations', userId);
    await mkdir(dir, { recursive: true });

    const safeId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const fileName = `${safeId}.pdf`;
    const filePath = path.join(dir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const relativePath = `/uploads/declarations/${userId}/${fileName}`;

    const declaration = await prisma.declaration.create({
      data: {
        userId,
        firstName,
        lastName,
        trackingCode,
        price,
        currency: 'GEL',
        filePath: relativePath,
      },
    });

    return NextResponse.json(
      {
        message: 'დეკლარაცია წარმატებით გაიგზავნა',
        declaration: {
          id: declaration.id,
          trackingCode: declaration.trackingCode,
          status: declaration.status,
          createdAt: new Date(declaration.createdAt).toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Declaration submit error:', err);
    return NextResponse.json(
      { error: 'დეკლარაციის გაგზავნისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
