import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { createAnnouncementSchema } from '@/lib/validators'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    // Build where clause
    let whereClause: any = {
      organizationId: session.organizationId,
      isActive: true
    }

    if (propertyId) {
      whereClause.propertyId = propertyId
    } else {
      whereClause.propertyId = null // General announcements
    }

    const announcements = await db.announcement.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json(announcements)

  } catch (error) {
    console.error('Get announcements error:', error)
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

    // Check if user is landlord or property manager
    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createAnnouncementSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { title, content, type, propertyId } = validation.data

    // If propertyId is provided, verify it belongs to the organization
    if (propertyId) {
      const property = await db.property.findFirst({
        where: {
          id: propertyId,
          organizationId: session.organizationId
        }
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found or access denied' },
          { status: 404 }
        )
      }
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        type: type || 'general',
        organizationId: session.organizationId,
        propertyId
      },
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    })

  } catch (error) {
    console.error('Create announcement error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}