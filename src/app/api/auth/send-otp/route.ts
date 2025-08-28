import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOtpSchema } from '@/lib/validators'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = sendOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { phone, role } = validation.data

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
            name: 'Default Organization',
            email: 'default@manzilos.com'
          }
        })
      }

      user = await db.user.create({
        data: {
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}