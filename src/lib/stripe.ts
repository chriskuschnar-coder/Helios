import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6'

console.log('🔍 Stripe Configuration:')
console.log('Publishable Key:', stripePublishableKey ? 'Loaded ✅' : 'Missing ❌')

// Create Stripe promise
export const stripePromise = loadStripe(stripePublishableKey)

// Stripe configuration
export const STRIPE_CONFIG = {
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
  },
  clientSecret: '',
}

// Card Element options
export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      letterSpacing: '0.025em',
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: '1.5',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
    },
    complete: {
      color: '#059669',
    },
  },
  hidePostalCode: false,
}

// Create payment intent
export async function createPaymentIntent(amount: number, userId?: string) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        user_id: userId || 'demo-user'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to create payment intent')
    }

    return await response.json()
  } catch (error) {
    console.error('Payment intent creation error:', error)
    throw error
  }
}