import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const threads = await prisma.chatThread.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      threads: threads.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt).toLocaleString('ka-GE'),
      })),
    });
  } catch (e) {
    console.error('Get chat threads error:', e);
    return NextResponse.json(
      { error: 'შეცდომა ჩათების წამოღებისას' },
      { status: 500 }
    );
  }
}

