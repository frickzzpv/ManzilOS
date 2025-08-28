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

    // Get recent payments
    const payments = await db.payment.findMany({
      where: {
        organizationId: session.organizationId,
        dueDate: {
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
        lease: {
          include: {
            unit: {
              select: {
                number: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      },
      take: 10
    })

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      tenantName: payment.tenant.name || payment.tenant.phone,
      unitNumber: payment.lease.unit.number,
      amount: payment.amount,
      status: payment.status,
      dueDate: payment.dueDate.toISOString()
    }))

    return NextResponse.json(formattedPayments)

  } catch (error) {
    console.error('Dashboard payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}