import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { AdminCacheTags, adminChatThreadTag } from '@/lib/cache/adminCache';
import { invalidateCacheTags } from '@/lib/cache/redisCache';

const baseSchema = z.object({
  threadId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = baseSchema.parse(body);
    const session = await getServerSession(authOptions);

    let threadId = data.threadId;
    let createdNewThread = false;
    let smsFromLabel: string | null = null;

    if (threadId) {
      // Ensure thread exists
      const existing = await prisma.chatThread.findUnique({
        where: { id: threadId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404, headers: corsHeaders }
        );
      }
    } else {
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        });
        if (!user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401, headers: corsHeaders }
          );
        }
        const firstName = user.firstName?.trim() || 'User';
        const lastName = user.lastName?.trim() || '—';
        const phone =
          user.phone?.trim() || `user-${user.id.slice(0, 10)}`;

        const thread = await prisma.chatThread.create({
          data: {
            firstName,
            lastName,
            email: user.email,
            phone,
            userId: user.id,
            status: 'open',
          },
        });
        threadId = thread.id;
        createdNewThread = true;
        smsFromLabel = `${firstName} ${lastName} (${user.email})`.trim();
      } else {
        const guestFirst = data.firstName?.trim();
        const guestLast = data.lastName?.trim();
        const guestEmail = data.email?.trim();
        if (!guestFirst || !guestLast || !guestEmail) {
          return NextResponse.json(
            {
              error:
                'შეავსეთ სახელი, გვარი და ელ-ფოსტა ახალი საუბრის დასაწყებად.',
            },
            { status: 400, headers: corsHeaders }
          );
        }
        const emailParsed = z.string().email().safeParse(guestEmail);
        if (!emailParsed.success) {
          return NextResponse.json(
            { error: 'ელ-ფოსტის ფორმატი არასწორია.' },
            { status: 400, headers: corsHeaders }
          );
        }
        const fallbackId = Date.now();
        const thread = await prisma.chatThread.create({
          data: {
            firstName: guestFirst,
            lastName: guestLast,
            email: guestEmail,
            phone: data.phone?.trim() || `guest-${fallbackId}`,
            status: 'open',
          },
        });
        threadId = thread.id;
        createdNewThread = true;
        smsFromLabel = `${guestFirst} ${guestLast} (${guestEmail})`.trim();
      }
    }

    // Create user message
    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        sender: 'USER',
        text: data.message,
      },
    });

    void invalidateCacheTags([AdminCacheTags.chatThreads, adminChatThreadTag(threadId)]);
    return NextResponse.json(
      {
        threadId,
        messageId: message.id,
        status: 'ok',
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('Chat webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

