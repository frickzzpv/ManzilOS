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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, assignedToId, vendorId, estimatedCost, actualCost, notes, scheduledDate } = await request.json()

    // Find the maintenance request
    const maintenanceRequest = await db.maintenanceRequest.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.organizationId
      }
    })

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      )
    }

    // Check permissions based on role
    if (decoded.role === 'TENANT') {
      // Tenants can only cancel their own requests
      if (maintenanceRequest.tenantId !== decoded.userId || status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Update the maintenance request
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) updateData.status = status
    if (assignedToId) updateData.assignedToId = assignedToId
    if (vendorId) updateData.vendorId = vendorId
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost
    if (actualCost !== undefined) updateData.actualCost = actualCost
    if (notes !== undefined) updateData.notes = notes
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}