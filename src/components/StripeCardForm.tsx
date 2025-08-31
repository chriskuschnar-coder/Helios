import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield, CreditCard } from 'lucide-react'

// Create Stripe promise - but we'll wait for it to fully resolve
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

interface StripeCardFormProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripe, setStripe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY)
        setStripe(stripeInstance)
      } catch (error) {
        console.error('Failed to load Stripe:', error)
        onError('Failed to initialize payment system')
      } finally {
        setLoading(false)
      }
    }

    initializeStripe()
  }, [onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payment form...</span>
      </div>
    )
  }

  if (!stripe) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <CreditCard className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Payment system unavailable</p>
          <p className="text-sm text-gray-600 mt-1">Please try again later</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm text-gray-600">Secure Payment</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          ${(amount / 100).toFixed(2)}
        </p>
      </div>

      <Elements stripe={stripe}>
        <StripeCardFormInner
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          onClose={onClose}
        />
      </Elements>
    </div>
  )
}