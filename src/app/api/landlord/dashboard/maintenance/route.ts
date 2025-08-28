import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get recent maintenance requests
    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: {
        organizationId: session.organizationId,
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