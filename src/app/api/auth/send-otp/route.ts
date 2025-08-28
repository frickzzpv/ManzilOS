import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { phone, role } = await request.json()

    if (!phone || !role) {
      return NextResponse.json(
        { error: 'Phone number and role are required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')

    // Check if user exists
    let user = await db.user.findUnique({
      where: { phone: normalizedPhone },
      include: { organization: true }
    })

    // If user doesn't exist, create a new one
    if (!user) {
      // For demo purposes, create a default organization
      let organization = await db.organization.findFirst()

      if (!organization) {
        organization = await db.organization.create({
          data: {
            id: uuidv4(),
            name: 'Default Organization',
            email: 'default@manzilos.com'
          }
        })
      }

      user = await db.user.create({
        data: {
          id: uuidv4(),
          phone: normalizedPhone,
          email: `${normalizedPhone}@temp.com`,
          role: role.toUpperCase(),
          status: 'PENDING',
          organizationId: organization.id
        },
        include: { organization: true }
      })
    }

    // Generate OTP (in production, use a proper OTP service)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in a temporary storage (in production, use Redis or similar)
    // For now, we'll just return it in the response for demo purposes
    // In production, you would send this via SMS using Twilio or similar service

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp, // Remove this in production
      userId: user.id,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        status: user.status,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}