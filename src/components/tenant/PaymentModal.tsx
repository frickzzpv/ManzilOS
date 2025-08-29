"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import axios from 'axios'
import { StripePaymentForm } from './StripePaymentForm'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const api = axios.create({
  baseURL: '/api',
})

interface PaymentModalProps {
  paymentId: string
  onSuccess: () => void
}

export function PaymentModal({ paymentId, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await api.post(`/payments/${paymentId}/create-intent`)
        setClientSecret(data.clientSecret)
      } catch (error) {
        toast.error('Failed to initialize payment. Please try again.')
      }
    }
    createPaymentIntent()
  }, [paymentId])

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div>
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <StripePaymentForm
            paymentIntentClientSecret={clientSecret}
            onSuccess={onSuccess}
          />
        </Elements>
      ) : (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  )
}
