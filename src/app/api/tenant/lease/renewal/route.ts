import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const renewalResponseSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = renewalResponseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { status } = validation.data

    // Find the tenant's active lease
    const lease = await db.lease.findFirst({
      where: {
        tenantId: session.userId,
        status: 'active',
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Active lease not found' }, { status: 404 })
    }

    const updatedLease = await db.lease.update({
      where: { id: lease.id },
      data: { renewalOfferStatus: status },
    })

    // In a real app, you would notify the landlord here

    return NextResponse.json(updatedLease)
  } catch (error) {
    console.error('Lease renewal response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
