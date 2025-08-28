import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
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

    const comments = await db.maintenanceComment.findMany({
      where: {
        requestId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
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

    const body = await request.json()
    const validation = createCommentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { content } = validation.data

    const comment = await db.maintenanceComment.create({
      data: {
        content,
        requestId: params.id,
        userId: session.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    // Notify relevant parties
    // (Implementation omitted for brevity, but would be similar to the
    // maintenance request creation notification)

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
