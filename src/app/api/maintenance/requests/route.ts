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

    const { title, description, category, priority, unitId } = await request.json()

    if (!title || !description || !category || !unitId) {
      return NextResponse.json(
        { error: 'Title, description, category, and unitId are required' },
        { status: 400 }
      )
    }

    // Verify the unit belongs to the user's organization
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        property: {
          organizationId: decoded.organizationId
        }
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    // Create maintenance request
    const maintenanceRequest = await db.maintenanceRequest.create({
      data: {
        id: uuidv4(),
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        organizationId: decoded.organizationId,
        propertyId: unit.propertyId,
        unitId,
        tenantId: decoded.userId,
        createdById: decoded.userId,
        status: 'PENDING'
      },
      include: {
        unit: {
          select: {
            number: true,
            property: {
              select: {
                name: true,
                address: true
              }
            }
          }
        },
        tenant: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Maintenance request created successfully',
      request: maintenanceRequest
    })

  } catch (error) {
    console.error('Create maintenance request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause based on user role
    let whereClause: any = {
      organizationId: decoded.organizationId
    }

    if (decoded.role === 'TENANT') {
      whereClause.tenantId = decoded.userId
    }

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        unit: {
          select: {
            number: true,
            property: {
              select: {
                name: true,
                address: true
              }
            }
          }
        },
        tenant: {
          select: {
            name: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            name: true,
            phone: true
          }
        },
        vendor: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(maintenanceRequests)

  } catch (error) {
    console.error('Get maintenance requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}