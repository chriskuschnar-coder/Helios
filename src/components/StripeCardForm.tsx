import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield, CreditCard } from 'lucide-react'

// Create Stripe promise - but we'll wait for it to fully resolve
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripeInstance, setStripeInstance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initializationStep, setInitializationStep] = useState('Loading Stripe script...')

  useEffect(() => {
    let isMounted = true
    
    console.log('🔄 Starting Stripe initialization process...')
    setInitializationStep('Loading Stripe script...')
    
    // Wait for Stripe to be fully ready
    loadStripe(STRIPE_PUBLISHABLE_KEY)
      .then((stripeInstance) => {
        if (!isMounted) return
        
        console.log('✅ Stripe instance loaded:', !!stripeInstance)
        
        if (!stripeInstance) {
          setError('Failed to load Stripe. Please check your internet connection.')
          setLoading(false)
          return
        }
        
        setInitializationStep('Initializing payment elements...')
        
        // Additional delay to ensure Stripe is fully ready
        setTimeout(() => {
          if (isMounted) {
            console.log('✅ Stripe fully initialized and ready')
            setStripeInstance(stripeInstance)
            setLoading(false)
          }
        }, 500) // Give Stripe extra time to fully initialize
      })
      .catch((err) => {
        if (isMounted) {
          console.error('❌ Stripe loading error:', err)
          setError('Failed to load payment system: ' + err.message)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Additional check for Stripe readiness
  useEffect(() => {
    if (stripeInstance) {
      // Verify Stripe is actually ready
      const checkStripeReady = () => {
        try {
          // Test if Stripe can create elements
          const testElements = stripeInstance.elements()
          if (testElements) {
            console.log('✅ Stripe Elements factory is working')
          }
        } catch (err) {
          console.warn('⚠️ Stripe not fully ready yet:', err)
          setError('Payment system still initializing. Please wait...')
        }
      }
      
      checkStripeReady()
    }
  }, [stripeInstance])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="font-medium text-blue-900">Secure Payment System</span>
          </div>
          <p className="text-sm text-blue-700">
            {initializationStep}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Establishing secure connection to Stripe servers...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Payment System Error</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Retry Payment System
        </button>
      </div>
    )
  }

  if (!stripeInstance) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Payment System Unavailable</span>
          </div>
          <p className="text-sm text-yellow-700">
            Unable to initialize Stripe. This may be due to network restrictions or ad blockers.
          </p>
        </div>
      </div>
    )
  }

  // Only render Elements when Stripe is fully ready
  return (
    <Elements stripe={stripeInstance}>
      <StripeCardFormInner 
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </Elements>
  )
}
          
          if (!stripeInstance) {
            setError('Failed to load Stripe. Please check your internet connection.')
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('❌ Stripe loading error:', err)
          setError('Failed to load payment system: ' + err.message)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="font-medium text-blue-900">Loading Secure Payment System</span>
          </div>
          <p className="text-sm text-blue-700">
            Initializing Stripe Elements... Please wait while we establish a secure connection.
          </p>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Connecting to Stripe servers...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Payment System Error</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Retry Payment System
        </button>
      </div>
    )
  }

  if (!stripe) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Payment System Unavailable</span>
          </div>
          <p className="text-sm text-yellow-700">
            Unable to initialize Stripe. This may be due to network restrictions or ad blockers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripe}>
      <StripeCardFormInner 
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </Elements>
  )
}