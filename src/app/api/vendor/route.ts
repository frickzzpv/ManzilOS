import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const vendors = await db.vendor.findMany({
      where: {
        organizationId: session.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Get vendors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
