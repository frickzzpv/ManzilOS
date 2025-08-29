import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { z } from 'zod'

const tenantFormSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
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

    const tenants = await db.user.findMany({
      where: {
        organizationId: session.organizationId,
        role: 'TENANT',
      },
      include: {
        tenantLeases: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Get tenants error:', error)
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
        const validation = tenantFormSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
        }

        const { name, email, phone } = validation.data

        const tenant = await db.user.create({
            data: {
                name,
                email,
                phone,
                role: 'TENANT',
                status: 'PENDING',
                organizationId: session.organizationId,
            },
        })

        return NextResponse.json(tenant, { status: 201 })

    } catch (error) {
        console.error('Create tenant error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
