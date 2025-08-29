import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is vendor
    if (session.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const vendor = await db.vendor.findFirst({
        where: { email: session.email }
    })

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Get vendor's jobs
    let whereClause: any = {
      vendorId: vendor.id,
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