import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const propertyFormSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().optional(),
    type: z.string().min(1),
    totalUnits: z.number().int().min(1),
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

    const properties = await db.property.findMany({
      where: {
        organizationId: session.organizationId,
      },
      include: {
        units: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Get properties error:', error)
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
        const validation = propertyFormSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
        }

        const { name, address, city, postalCode, type, totalUnits } = validation.data

        const property = await db.property.create({
            data: {
                name,
                address,
                city,
                postalCode,
                type,
                totalUnits,
                organizationId: session.organizationId,
            },
        })

        return NextResponse.json(property, { status: 201 })

    } catch (error) {
        console.error('Create property error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
