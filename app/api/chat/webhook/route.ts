import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const baseSchema = z.object({
  threadId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

const newThreadFieldsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
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

    let threadId = data.threadId;

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
      // Validate required fields for new thread
      const info = newThreadFieldsSchema.parse({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      // Create new thread
      const thread = await prisma.chatThread.create({
        data: {
          firstName: info.firstName,
          lastName: info.lastName,
          email: info.email,
          phone: info.phone,
          status: 'open',
        },
      });
      threadId = thread.id;
    }

    // Create user message
    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        sender: 'USER',
        text: data.message,
      },
    });

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

