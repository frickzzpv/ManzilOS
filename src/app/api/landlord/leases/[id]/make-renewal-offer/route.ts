import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { createNotification } from '@/lib/notification-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const lease = await db.lease.findFirst({
      where: {
        id: params.id,
        organizationId: session.organizationId,
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    const updatedLease = await db.lease.update({
      where: { id: params.id },
      data: { renewalOfferStatus: 'SENT' },
    })

    await createNotification({
        userId: lease.tenantId,
        type: 'LEASE_RENEWAL',
        title: 'Lease Renewal Offer',
        message: `You have received a lease renewal offer. Please review it in your dashboard.`,
        channel: 'PUSH',
    });

    return NextResponse.json(updatedLease)
  } catch (error) {
    console.error('Make renewal offer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
