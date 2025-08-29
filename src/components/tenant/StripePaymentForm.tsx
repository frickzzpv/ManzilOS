"use client"

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface StripePaymentFormProps {
  paymentIntentClientSecret: string
  onSuccess: () => void
}

export function StripePaymentForm({
  paymentIntentClientSecret,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return
    }

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is not strictly needed if we handle success/error client-side
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.')
      toast.error(error.message || 'An unexpected error occurred.')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!')
      onSuccess()
    } else {
        // Handle other statuses like 'processing' if needed
    }


    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="mt-4 w-full">
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
    </form>
  )
}
