import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { stripe } from '@/lib/stripe-service'
import logger from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const session = await getUserSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paymentId = params.paymentId
  const log = logger.child({ paymentId, userId: session.userId, api: '/api/payments/create-intent' })

  try {
    log.info('Attempting to create payment intent')

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
        log.warn('Payment not found')
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'COMPLETED') {
        log.warn('Payment already completed')
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

    log.info('Payment intent created successfully')
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })

  } catch (error) {
    log.error(error, 'Failed to create payment intent')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
