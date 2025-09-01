import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripePromise = loadStripe(stripePublishableKey)

// Stripe payment methods configuration
export const STRIPE_PAYMENT_METHODS = {
  card: {
    name: 'Credit/Debit Card',
    description: 'Instant funding with 2.9% + $0.30 fee',
    fees: { percentage: 2.9, fixed: 0.30 },
    processingTime: 'Instant'
  },
  ach: {
    name: 'Bank Transfer (ACH)',
    description: '1-3 business days, $5 fee',
    fees: { percentage: 0, fixed: 5.00 },
    processingTime: '1-3 business days'
  }
}

export interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface CreatePaymentIntentRequest {
  amount: number
  currency?: string
  payment_method_types?: string[]
  metadata?: Record<string, string>
}