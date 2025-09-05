import React, { ReactNode } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_live_YOUR_NEW_PUBLISHABLE_KEY_HERE')

interface StripeElementsProviderProps {
  children: ReactNode
  clientSecret?: string
}

export function StripeElementsProvider({ children, clientSecret }: StripeElementsProviderProps) {
  // If no clientSecret provided, render children without Elements wrapper
  if (!clientSecret) {
    return <>{children}</>
  }

  // Render with Elements provider when clientSecret is available
  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
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
      }}
    >
      {children}
    </Elements>
  )
}