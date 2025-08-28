import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is tenant
    if (session.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get tenant's maintenance requests
    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: {
        tenantId: session.userId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
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
      description: request.description,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt.toISOString()
    }))

    return NextResponse.json(formattedRequests)

  } catch (error) {
    console.error('Tenant maintenance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}