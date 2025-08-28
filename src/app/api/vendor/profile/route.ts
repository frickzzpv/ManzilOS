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

    // Check if user is vendor
    if (decoded.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get vendor profile
    const vendor = await db.vendor.findFirst({
      where: {
        organizationId: decoded.organizationId,
        // In a real implementation, you would link vendor to user
        // For now, we'll get the first vendor in the organization
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      )
    }

    const vendorProfile = {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      status: vendor.status,
      rating: vendor.rating || 0,
      specialties: vendor.specialties ? JSON.parse(vendor.specialties) : []
    }

    return NextResponse.json(vendorProfile)

  } catch (error) {
    console.error('Get vendor profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}