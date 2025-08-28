import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

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

    // Check if user is landlord or property manager
    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get recent maintenance requests
    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: {
        organizationId: decoded.organizationId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        tenant: {
          select: {
            name: true,
            phone: true
          }
        },
        unit: {
          select: {
            number: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const formattedRequests = maintenanceRequests.map(request => ({
      id: request.id,
      title: request.title,
      unitNumber: request.unit.number,
      tenantName: request.tenant.name || request.tenant.phone,
      priority: request.priority,
      status: request.status,
      createdAt: request.createdAt.toISOString()
    }))

    return NextResponse.json(formattedRequests)

  } catch (error) {
    console.error('Dashboard maintenance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}