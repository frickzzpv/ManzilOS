import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { updateMaintenanceRequestSchema } from '@/lib/validators'
import { z } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateMaintenanceRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { status, assignedToId, vendorId, estimatedCost, actualCost, notes, scheduledDate } = validation.data

    // Find the maintenance request
    const maintenanceRequest = await db.maintenanceRequest.findFirst({
      where: {
        id: params.id,
        organizationId: session.organizationId
      }
    })

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      )
    }

    // Check permissions based on role
    if (session.role === 'TENANT') {
      // Tenants can only cancel their own requests
      if (maintenanceRequest.tenantId !== session.userId || status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Update the maintenance request
    const updateData: any = {
      ...validation.data
    }

    // Set completed date when status is completed
    if (status === 'COMPLETED') {
      updateData.completedDate = new Date()
    }

    const updatedRequest = await db.maintenanceRequest.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Maintenance request updated successfully',
      request: updatedRequest
    })

  } catch (error) {
    console.error('Update maintenance request error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}