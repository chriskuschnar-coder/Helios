import { loadStripe } from '@stripe/stripe-js'

// Use your working Stripe keys directly
const stripePublishableKey = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

console.log('🔍 Stripe Configuration:')
console.log('Publishable Key:', stripePublishableKey ? 'Loaded ✅' : 'Missing ❌')
console.log('Key format:', stripePublishableKey.startsWith('pk_test_') ? 'Test key ✅' : 'Live key ✅')

// Create Stripe promise
export const stripePromise = loadStripe(stripePublishableKey)

// Enhanced Stripe configuration
export const STRIPE_CONFIG = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1e40af',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  clientSecret: '',
}

// Professional Card Element options
export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      letterSpacing: '0.025em',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.5',
      '::placeholder': {
        color: '#9ca3af',
      },
      ':-webkit-autofill': {
        color: '#1f2937',
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    },
    complete: {
      color: '#059669',
      iconColor: '#059669'
    },
  },
  hidePostalCode: false,
  iconStyle: 'solid' as const,
  disabled: false
}

// Create payment intent with enhanced error handling
export async function createPaymentIntent(amount: number, userId?: string) {
  try {
    console.log('💳 Creating payment intent:', { amount, userId })
    
    if (amount < 100) {
      throw new Error('Minimum amount is $100')
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured')
    }

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
      console.error('❌ Payment intent creation failed:', errorData)
      throw new Error(errorData.error?.message || 'Failed to create payment intent')
    }

    const result = await response.json()
    console.log('✅ Payment intent created successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Payment intent creation error:', error)
    throw error
  }
}

// Test Stripe connection
export async function testStripeConnection() {
  try {
    const stripe = await stripePromise
    if (stripe) {
      console.log('✅ Stripe connection test successful')
      return { success: true, stripe }
    } else {
      console.error('❌ Stripe connection test failed - no instance')
      return { success: false, error: 'Failed to load Stripe' }
    }
  } catch (error) {
    console.error('❌ Stripe connection test error:', error)
    return { success: false, error: error.message }
  }
}