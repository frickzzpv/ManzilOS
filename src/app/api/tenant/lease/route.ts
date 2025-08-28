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

    // Get tenant's active lease
    const lease = await db.lease.findFirst({
      where: {
        tenantId: session.userId,
        status: 'active'
      },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      }
    })

    if (!lease) {
      return NextResponse.json(
        { error: 'No active lease found' },
        { status: 404 }
      )
    }

    const leaseInfo = {
      id: lease.id,
      unitNumber: lease.unit.number,
      propertyAddress: `${lease.unit.property.address}, ${lease.unit.property.city}`,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      monthlyRent: lease.monthlyRent,
      status: lease.status
    }

    return NextResponse.json(leaseInfo)

  } catch (error) {
    console.error('Tenant lease error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}