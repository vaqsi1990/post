import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const thread = await prisma.chatThread.findUnique({
      where: { id },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        createdAt: new Date(m.createdAt).toLocaleString('ka-GE'),
      })),
    });
  } catch (e) {
    console.error('Public chat messages error:', e);
    return NextResponse.json(
      { error: 'შეტყობინებების წაკითხვის შეცდომა' },
      { status: 500 }
    );
  }
}

