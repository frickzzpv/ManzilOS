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

    // Get tenant's payments
    const payments = await db.payment.findMany({
      where: {
        tenantId: decoded.userId,
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