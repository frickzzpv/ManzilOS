import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const leaseFormSchema = z.object({
    tenantId: z.string().min(1),
    unitId: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    monthlyRent: z.number().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const leases = await db.lease.findMany({
      where: {
        organizationId: session.organizationId,
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(leases)
  } catch (error) {
    console.error('Get leases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getUserSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!['LANDLORD', 'PROPERTY_MANAGER'].includes(session.role)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()
        const validation = leaseFormSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
        }

        const { tenantId, unitId, startDate, endDate, monthlyRent } = validation.data

        const unit = await db.unit.findFirst({
            where: { id: unitId, property: { organizationId: session.organizationId } }
        })

        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
        }

        const lease = await db.$transaction(async (prisma) => {
            const newLease = await prisma.lease.create({
                data: {
                    tenantId,
                    unitId,
                    propertyId: unit.propertyId,
                    organizationId: session.organizationId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    monthlyRent,
                },
            })

            await prisma.unit.update({
                where: { id: unitId },
                data: { status: 'occupied' },
            })

            return newLease
        })

        return NextResponse.json(lease, { status: 201 })

    } catch (error) {
        console.error('Create lease error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
