import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { createVisitorPassSchema } from '@/lib/validators'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

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

    const visitorPasses = await db.visitorPass.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        },
        unit: {
          select: {
            number: true
          }
        },
        tenant: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return NextResponse.json(visitorPasses)

  } catch (error) {
    console.error('Get visitor passes error:', error)
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

    // Check if user is tenant
    if (session.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createVisitorPassSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { visitorName, visitorPhone, purpose, validFrom, validTo, unitId } = validation.data

    // Verify the unit belongs to the user's organization and tenant
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        property: {
          organizationId: session.organizationId
        },
        leases: {
          some: {
            tenantId: session.userId,
            status: 'active'
          }
        }
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found or access denied' },
        { status: 404 }
      )
    }

    // Generate unique QR code
    const qrCodeId = uuidv4()
    const qrCodeData = `https://manzilos.com/visitor/${qrCodeId}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeData)

    const visitorPass = await db.visitorPass.create({
      data: {
        qrCode: qrCodeId,
        visitorName,
        visitorPhone,
        purpose,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        organizationId: session.organizationId,
        propertyId: unit.propertyId,
        unitId,
        tenantId: session.userId
      },
      include: {
        property: {
          select: {
            name: true,
            address: true
          }
        },
        unit: {
          select: {
            number: true
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

    return NextResponse.json({
      success: true,
      message: 'Visitor pass created successfully',
      visitorPass: {
        ...visitorPass,
        qrCodeImage
      }
    })

  } catch (error) {
    console.error('Create visitor pass error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}