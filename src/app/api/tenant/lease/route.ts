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

    // Check if user is tenant
    if (decoded.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get tenant's active lease
    const lease = await db.lease.findFirst({
      where: {
        tenantId: decoded.userId,
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