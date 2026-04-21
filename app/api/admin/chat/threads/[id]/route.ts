import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminCacheTags, adminChatThreadTag, cachedAdmin } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

export const dynamic = 'force-dynamic';

const replySchema = z.object({
  message: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true as const };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const data = await cachedAdmin(
      'chat:thread:get:v1',
      { role: auth.ok ? 'ADMIN' : 'unknown', id },
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
      { ttlSeconds: 30, tags: [AdminCacheTags.chatThreads, adminChatThreadTag(id)] },
    );

    if (!data) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({
      thread: {
        ...data.thread,
        createdAt: new Date(data.thread.createdAt).toLocaleString('ka-GE'),
      },
      messages: data.messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt).toLocaleString('ka-GE'),
      })),
    });
  } catch (e) {
    console.error('Get chat messages error:', e);
    return NextResponse.json(
      { error: 'შეტყობინებების წამოღების შეცდომა' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = replySchema.parse(body);

    const thread = await prisma.chatThread.findUnique({
      where: { id },
    });
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId: id,
        sender: 'ADMIN',
        text: data.message,
      },
    });

    // Optionally, could notify external system here via webhook call.
    void invalidateCacheTags([AdminCacheTags.chatThreads, adminChatThreadTag(id)]);

    return NextResponse.json(
      {
        message: 'შეტყობინება გაიგზავნა',
        id: message.id,
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ვალიდაციის შეცდომა',
          details: e.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Send chat reply error:', e);
    return NextResponse.json(
      { error: 'შეტყობინება ვერ გაიგზავნა' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const status = typeof body.status === 'string' ? body.status : 'closed';

    const updated = await prisma.chatThread.update({
      where: { id },
      data: { status },
    });

    void invalidateCacheTags([AdminCacheTags.chatThreads, adminChatThreadTag(id)]);
    return NextResponse.json(
      {
        message: 'დიალოგის სტატუსი განახლდა',
        status: updated.status,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('Update chat thread error:', e);
    return NextResponse.json(
      { error: 'დიალოგის დახურვა ვერ მოხერხდა' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  try {
    await prisma.chatThread.delete({
      where: { id },
    });

    void invalidateCacheTags([AdminCacheTags.chatThreads, adminChatThreadTag(id)]);
    return NextResponse.json(
      { message: 'დიალოგი წაიშალა' },
      { status: 200 }
    );
  } catch (e) {
    console.error('Delete chat thread error:', e);
    return NextResponse.json(
      { error: 'დიალოგის წაშლა ვერ მოხერხდა' },
      { status: 500 }
    );
  }
}


