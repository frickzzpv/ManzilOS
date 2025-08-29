import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { stripe } from '@/lib/stripe-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getUserSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paymentId = params.paymentId

    const payment = await db.payment.findFirst({
      where: {
        id: paymentId,
        tenantId: session.userId,
      },
      include: {
        tenant: true,
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Payment has already been completed.'}, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Stripe expects amount in cents
        currency: 'usd', // This should probably be configurable
        metadata: {
            paymentId: payment.id,
            tenantId: payment.tenantId,
            userId: session.userId,
        },
    });

    // Update our payment record with the Payment Intent ID
    await db.payment.update({
        where: { id: payment.id },
        data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })

  } catch (error) {
    console.error('Create Payment Intent Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
