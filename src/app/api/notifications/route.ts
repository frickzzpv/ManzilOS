import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
    try {
      const session = await getUserSession(request)
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { notificationIds } = await request.json()

      await db.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          },
          userId: session.userId,
        },
        data: {
          readAt: new Date(),
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Mark notifications as read error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
