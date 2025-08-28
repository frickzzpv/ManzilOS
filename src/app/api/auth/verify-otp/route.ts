import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, userId } = await request.json()

    if (!phone || !otp || !userId) {
      return NextResponse.json(
        { error: 'Phone, OTP, and user ID are required' },
        { status: 400 }
      )
    }

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
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
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

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}