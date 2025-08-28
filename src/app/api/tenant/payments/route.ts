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

    // Get tenant's payments
    const payments = await db.payment.findMany({
      where: {
        tenantId: session.userId,
        dueDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      orderBy: {
        dueDate: 'desc'
      },
      take: 12
    })

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      dueDate: payment.dueDate.toISOString(),
      status: payment.status,
      method: payment.method
    }))

    return NextResponse.json(formattedPayments)

  } catch (error) {
    console.error('Tenant payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}