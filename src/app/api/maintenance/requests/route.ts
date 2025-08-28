import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { createMaintenanceRequestSchema } from '@/lib/validators'
import { createNotification } from '@/lib/notification-service'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createMaintenanceRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { title, description, category, priority, unitId, images } = validation.data

    // Verify the unit belongs to the user's organization
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        property: {
          organizationId: session.organizationId
        }
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    // RBAC: If user is a tenant, ensure they are associated with the unit
    if (session.role === 'TENANT') {
        const lease = await db.lease.findFirst({
            where: {
                tenantId: session.userId,
                unitId: unitId,
                status: 'active'
            }
        })

        if (!lease) {
            return NextResponse.json(
                { error: 'You are not authorized to create a request for this unit' },
                { status: 403 }
            )
        }
    }

    // Create maintenance request
    const maintenanceRequest = await db.maintenanceRequest.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        organizationId: session.organizationId,
        propertyId: unit.propertyId,
        unitId,
        tenantId: session.userId,
        createdById: session.userId,
        status: 'PENDING',
        images: images ? JSON.stringify(images) : undefined,
      },
      include: {
        unit: {
          select: {
            number: true,
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
        }
      }
    })

    // Notify property managers
    const propertyManagers = await db.user.findMany({
      where: {
        organizationId: session.organizationId,
        role: 'PROPERTY_MANAGER'
      }
    })

    for (const manager of propertyManagers) {
      await createNotification({
        userId: manager.id,
        type: 'MAINTENANCE_UPDATE',
        title: 'New Maintenance Request',
        message: `A new maintenance request has been submitted for Unit ${unit.number}.`,
        channel: 'PUSH'
      })
    }


    return NextResponse.json({
      success: true,
      message: 'Maintenance request created successfully',
      request: maintenanceRequest
    })

  } catch (error) {
    console.error('Create maintenance request error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause based on user role
    let whereClause: any = {
      organizationId: session.organizationId
    }

    if (session.role === 'TENANT') {
      whereClause.tenantId = session.userId
    }

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        unit: {
          select: {
            number: true,
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
        assignedTo: {
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
      }
    })

    return NextResponse.json(maintenanceRequests)

  } catch (error) {
    console.error('Get maintenance requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}