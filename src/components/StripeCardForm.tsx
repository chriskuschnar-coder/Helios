import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { StripeCardFormInner } from './StripeCardFormInner'
import { Loader2, Shield } from 'lucide-react'

// Create Stripe promise
const stripePromise = loadStripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripe, setStripe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    
    console.log('🔄 Waiting for Stripe to fully initialize...')
    
    stripePromise
      .then((stripeInstance) => {
        if (isMounted) {
          console.log('✅ Stripe fully loaded:', stripeInstance)
          setStripe(stripeInstance)
          setLoading(false)
          
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