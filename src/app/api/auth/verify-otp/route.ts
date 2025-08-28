import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyOtpSchema } from '@/lib/validators'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = verifyOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 })
    }

    const { phone, otp, userId } = validation.data

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')

    // Find user
    const user = await db.user.findUnique({
      where: { id: userId, phone: normalizedPhone },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // In production, verify OTP against stored value
    // For demo purposes, we'll accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Update user status to active
    await db.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    cookies().set('manzilos_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        organization: user.organization
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}