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

    const { action, notes, actualCost } = await request.json()

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

    let updateData: any = {
      updatedAt: new Date()
    }

    switch (action) {
      case 'accept':
        updateData.status = 'IN_PROGRESS'
        // In a real implementation, you would assign to the specific vendor
        break

      case 'complete':
        updateData.status = 'COMPLETED'
        updateData.completedDate = new Date()
        if (notes) updateData.notes = notes
        if (actualCost !== undefined) updateData.actualCost = actualCost
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

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
      message: `Job ${action}ed successfully`,
      request: updatedRequest
    })

  } catch (error) {
    console.error('Vendor job action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}