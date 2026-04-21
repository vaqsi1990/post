import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AdminCacheTags, adminChatThreadTag, cachedAdmin } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

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
    const data = await cachedAdmin(
      'public:chat:thread:get:v1',
      { id },
      async () => {
        const thread = await prisma.chatThread.findUnique({
          where: { id },
        });

        if (!thread) return null;

        const messages = await prisma.chatMessage.findMany({
          where: { threadId: id },
          orderBy: { createdAt: 'asc' },
        });

        return { thread, messages };
      },
      { ttlSeconds: 10, tags: [AdminCacheTags.chatThreads, adminChatThreadTag(id)] },
    );

    if (!data) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    return NextResponse.json({
      thread: {
        firstName: data.thread.firstName,
        lastName: data.thread.lastName,
        email: data.thread.email,
      },
      messages: data.messages.map((m) => ({
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const status =
      typeof body.status === 'string' && body.status.length > 0
        ? body.status
        : 'closed';

    const updated = await prisma.chatThread.update({
      where: { id },
      data: { status },
    });

    void invalidateCacheTags([AdminCacheTags.chatThreads, adminChatThreadTag(id)]);
    return NextResponse.json(
      {
        message: 'დიალოგი დასრულდა',
        status: updated.status,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Public close chat error:', e);
    return NextResponse.json(
      { error: 'დიალოგის დასრულება ვერ მოხერხდა' },
      { status: 500 }
    );
  }
}


