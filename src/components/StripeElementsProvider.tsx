import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_live_51S2OIF3aD6OJYuckOW7RhBZ9xG0fHNkFSKCYVeRBjFMeusz0P9tSIvRyja7LY55HHhuhrgc5UZR6v78SrM9CE25300XPf5I5z4')

interface StripeElementsProviderProps {
  children: React.ReactNode
  clientSecret: string
}

export function StripeElementsProvider({ children, clientSecret }: StripeElementsProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#1e40af',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}