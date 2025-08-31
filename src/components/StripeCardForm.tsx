import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield, AlertCircle } from 'lucide-react'

// Create Stripe promise - single instance with proper key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

console.log('🔍 Stripe Configuration:')
console.log('Publishable Key:', STRIPE_PUBLISHABLE_KEY ? 'Loaded ✅' : 'Missing ❌')
console.log('Key format:', STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') ? 'Test key ✅' : 'Live key ✅')

// Create the Stripe promise
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

interface StripeCardFormProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripeReady, setStripeReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 StripeCardForm: Testing Stripe initialization...')
    
    const testStripe = async () => {
      try {
        // Wait for Stripe script to load
        let attempts = 0
        while (!(window as any).Stripe && attempts < 50) {
          console.log(`⏳ Waiting for window.Stripe... attempt ${attempts + 1}`)
          await new Promise(resolve => setTimeout(resolve, 200))
          attempts++
        }
        
        if (!(window as any).Stripe) {
          throw new Error('Stripe.js script failed to load')
        }
        
        console.log('✅ window.Stripe available')
        
        // Test the promise resolution
        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Failed to create Stripe instance')
        }
        
        console.log('✅ Stripe instance created successfully')
        console.log('🔍 Stripe version:', stripe.version || 'Version not available')
        
        setStripeReady(true)
        
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error)
        setInitError(error instanceof Error ? error.message : 'Failed to load payment system')
      }
    }

    testStripe()
  }, [])

  if (!stripeReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <div>
          <div className="text-gray-600 font-medium">Loading secure payment system...</div>
          <div className="text-xs text-gray-500 mt-1">
            {initError ? `Error: ${initError}` : 'Initializing Stripe.js...'}
          </div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Payment system unavailable</p>
          <p className="text-sm text-gray-600 mt-1">{initError}</p>
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

  console.log('🎯 Rendering Elements with Stripe promise')

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm text-gray-600">Secure Payment</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          Investment Processing
        </p>
      </div>

      {/* Elements wrapper with proper Stripe promise */}
      <Elements 
        stripe={stripePromise}
        options={{
          appearance: {
            theme: 'stripe',
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
        }}
      >
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