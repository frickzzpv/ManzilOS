import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is vendor
    if (session.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get vendor profile
    const vendor = await db.vendor.findFirst({
      where: {
        organizationId: session.organizationId,
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