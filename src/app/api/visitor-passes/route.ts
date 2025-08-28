import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JwtPayload {
  userId: string
  phone: string
  role: string
  organizationId: string
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where clause based on user role
    let whereClause: any = {
      organizationId: decoded.organizationId
    }

    if (decoded.role === 'TENANT') {
      whereClause.tenantId = decoded.userId
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
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Check if user is tenant
    if (decoded.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { visitorName, visitorPhone, purpose, validFrom, validTo, unitId } = await request.json()

    if (!visitorName || !validFrom || !validTo || !unitId) {
      return NextResponse.json(
        { error: 'Visitor name, valid dates, and unit ID are required' },
        { status: 400 }
      )
    }

    // Verify the unit belongs to the user's organization and tenant
    const unit = await db.unit.findFirst({
      where: {
        id: unitId,
        property: {
          organizationId: decoded.organizationId
        },
        leases: {
          some: {
            tenantId: decoded.userId,
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
        id: uuidv4(),
        qrCode: qrCodeId,
        visitorName,
        visitorPhone,
        purpose,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        organizationId: decoded.organizationId,
        propertyId: unit.propertyId,
        unitId,
        tenantId: decoded.userId
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}