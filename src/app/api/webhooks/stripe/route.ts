import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe-service'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.PaymentIntent

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = session

    try {
      await db.payment.update({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          status: 'COMPLETED',
          paidDate: new Date(),
        },
      })
    } catch (error) {
        console.error('Error updating payment status from webhook:', error)
        // If this fails, we should have a retry mechanism or logging to investigate
        return new NextResponse('Webhook Error: Failed to update payment status', { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
