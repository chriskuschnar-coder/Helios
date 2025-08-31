import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'

// Initialize Stripe promise outside component to avoid recreation
const stripePromise = loadStripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardFormInner 
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </Elements>
  )
}