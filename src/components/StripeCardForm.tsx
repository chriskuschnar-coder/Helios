import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield, CreditCard, AlertCircle } from 'lucide-react'

// Create Stripe promise - single instance
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

interface StripeCardFormProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripe, setStripe] = useState<any>(null)
  const [stripeLoading, setStripeLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    console.log('🔄 StripeCardForm: Starting Stripe initialization...')
    
    const initializeStripe = async () => {
      try {
        // Wait for window.Stripe to be available
        let attempts = 0
        while (!(window as any).Stripe && attempts < 100) {
          console.log(`⏳ Waiting for window.Stripe... attempt ${attempts + 1}`)
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        if (!(window as any).Stripe) {
          throw new Error('Stripe.js script failed to load after 10 seconds')
        }
        
        console.log('✅ window.Stripe available, creating Stripe instance...')
        
        // Create Stripe instance
        const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY)
        
        if (!stripeInstance) {
          throw new Error('Failed to create Stripe instance')
        }
        
        console.log('✅ Stripe instance created successfully')
        console.log('🔍 Stripe version:', stripeInstance.version || 'Version not available')
        
        if (mounted) {
          setStripe(stripeInstance)
          console.log('✅ Stripe set in state, ready for Elements')
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error)
        if (mounted) {
          setInitError(error instanceof Error ? error.message : 'Failed to load payment system')
        }
      } finally {
        if (mounted) {
          setStripeLoading(false)
        }
      }
    }

    initializeStripe()
    
    return () => {
      mounted = false
    }
  }, [])

  if (stripeLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <div>
          <div className="text-gray-600 font-medium">Loading secure payment system...</div>
          <div className="text-xs text-gray-500 mt-1">Initializing Stripe.js...</div>
        </div>
      </div>
    )
  }

  if (initError || !stripe) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Payment system unavailable</p>
          <p className="text-sm text-gray-600 mt-1">{initError || 'Failed to load Stripe'}</p>
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

  console.log('🎯 Rendering Elements with Stripe instance')

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm text-gray-600">Secure Payment</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          ${amount.toFixed(2)}
        </p>
      </div>

      {/* Elements wrapper with proper Stripe instance */}
      <Elements 
        stripe={stripe}
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