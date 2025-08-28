import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JwtPayload {
  userId: string
  phone: string
  role: string
  organizationId: string
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    // Build where clause
    let whereClause: any = {
      organizationId: decoded.organizationId,
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
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Check if user is landlord or property manager
    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { title, content, type, propertyId } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // If propertyId is provided, verify it belongs to the organization
    if (propertyId) {
      const property = await db.property.findFirst({
        where: {
          id: propertyId,
          organizationId: decoded.organizationId
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
        id: uuidv4(),
        title,
        content,
        type: type || 'general',
        organizationId: decoded.organizationId,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}