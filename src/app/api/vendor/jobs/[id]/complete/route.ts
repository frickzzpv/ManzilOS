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

export async function POST(
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

    // Check if user is vendor
    if (decoded.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { notes, actualCost } = await request.json()

    // Find the maintenance request
    const maintenanceRequest = await db.maintenanceRequest.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.organizationId,
        status: 'IN_PROGRESS'
      }
    })

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found or not in progress' },
        { status: 404 }
      )
    }

    // Update the maintenance request
    const updateData: any = {
      status: 'COMPLETED',
      completedDate: new Date(),
      updatedAt: new Date()
    }

    if (notes) updateData.notes = notes
    if (actualCost !== undefined) updateData.actualCost = actualCost

    const updatedRequest = await db.maintenanceRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        unit: {
          include: {
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
      message: 'Job completed successfully',
      request: updatedRequest
    })

  } catch (error) {
    console.error('Complete job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}