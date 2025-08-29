import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { getSocketIO } from '@/lib/socket'
import { z } from 'zod'

const sendMessageSchema = z.object({
  content: z.string().min(1),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // Verify user is a participant of the conversation
    const participant = await db.participant.findFirst({
      where: {
        conversationId,
        userId: session.userId,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // Verify user is a participant of the conversation
    const participant = await db.participant.findFirst({
      where: {
        conversationId,
        userId: session.userId,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { content } = validation.data

    const message = await db.message.create({
      data: {
        content,
        conversationId,
        senderId: session.userId,
      },
      include: {
        sender: {
            select: {
                id: true,
                name: true,
                avatar: true
            }
        }
      }
    })

    // Emit the new message to the conversation room
    const io = getSocketIO()
    io.to(conversationId).emit('new_message', message)

    return NextResponse.json(message)
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
