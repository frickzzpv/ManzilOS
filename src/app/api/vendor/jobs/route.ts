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

    // Check if user is vendor
    if (decoded.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get vendor's jobs
    let whereClause: any = {
      organizationId: decoded.organizationId,
      vendorId: {
        not: null // Jobs assigned to any vendor
      }
    }

    if (status) {
      whereClause.status = status
    }

    const jobs = await db.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        unit: {
          include: {
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
        vendor: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json(jobs)

  } catch (error) {
    console.error('Get vendor jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}