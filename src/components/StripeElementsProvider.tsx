import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6'
)

interface StripeElementsProviderProps {
  children: React.ReactNode
  clientSecret?: string
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
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          transition: 'border-color 0.2s ease',
        },
        '.Input:focus': {
          borderColor: '#1e40af',
          boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '14px',
        }
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  )
}