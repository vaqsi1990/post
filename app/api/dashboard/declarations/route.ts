import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { utapi } from '../../../../lib/uploadthing';
import { dashUserParcelsTag } from '@/lib/cache/dashboardCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

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
        { error: 'ინვოისისPDF ფაილის ატვირთვა აუცილებელია' },
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

    const uploadResult = await utapi.uploadFiles(file);

    if (uploadResult.error || !uploadResult.data?.url) {
      console.error('UploadThing error (declaration PDF):', uploadResult.error);
      return NextResponse.json(
        { error: 'ფაილის ატვირთვისას მოხდა შეცდომა' },
        { status: 500 },
      );
    }

    const fileUrl = uploadResult.data.url;

    const declaration = await prisma.declaration.create({
      data: {
        userId,
        firstName,
        lastName,
        trackingCode,
        price,
        currency: 'GEL',
        filePath: fileUrl,
      },
    });

    // Declaration is usually tied to a tracking code and affects user's workflow; keep dashboard fresh.
    void invalidateCacheTags([dashUserParcelsTag(userId)]);

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
