import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield, CreditCard } from 'lucide-react'

// Create Stripe promise and wait for full resolution
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
  const [forceRerender, setForceRerender] = useState(0)

  useEffect(() => {
    let mounted = true
    console.log('🔄 StripeCardForm: Starting Stripe initialization...')
    console.log('🔍 Checking window.Stripe:', !!(window as any).Stripe)
    
    const initializeStripe = async () => {
      try {
        console.log('📡 Loading Stripe with key:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...')
        
        // Wait for window.Stripe to be available first
        let attempts = 0
        while (!(window as any).Stripe && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        if (!(window as any).Stripe) {
          throw new Error('Stripe.js script failed to load')
        }
        
        console.log('✅ window.Stripe available, loading Stripe instance...')
        
        const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY)
        
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe - instance is null')
        }
        
        console.log('✅ Stripe loaded successfully:', stripeInstance)
        console.log('🔍 Stripe version:', stripeInstance.version || 'Version not available')
        
        // Wait for Stripe to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (mounted) {
          setStripe(stripeInstance)
          console.log('✅ Stripe set in state, ready to render Elements')
          
          // Force a rerender to ensure Elements mount properly
          setTimeout(() => {
            if (mounted) {
              setForceRerender(prev => prev + 1)
              console.log('🔄 Forced rerender to ensure Elements mount')
            }
          }, 200)
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="ml-2">
          <div className="text-gray-600">Loading secure payment system...</div>
          <div className="text-xs text-gray-500 mt-1">Waiting for Stripe.js to initialize...</div>
        </div>
      </div>
    )
  }

  if (initError || !stripe) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <CreditCard className="h-12 w-12 mx-auto mb-2" />
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

  console.log('🎯 Rendering Elements with resolved Stripe instance')

  return (
    <div className="max-w-md mx-auto" key={`stripe-form-${forceRerender}`}>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm text-gray-600">Secure Payment</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          ${amount.toFixed(2)}
        </p>
      </div>

      {/* Only render Elements after Stripe is fully resolved */}
      <Elements stripe={stripe} key={`elements-${forceRerender}`}>
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