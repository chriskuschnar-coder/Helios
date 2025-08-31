import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface StripeCardFormInnerProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

const CARD_ELEMENT_OPTIONS = {
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
}

export function StripeCardFormInner({ amount, onSuccess, onError, onClose }: StripeCardFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState('')
  const [processing, setProcessing] = useState(false)

  // Show loading state while Stripe initializes
  if (!stripe || !elements) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="font-medium text-blue-900">Initializing Secure Payment System</span>
          </div>
          <p className="text-sm text-blue-700">
            Loading Stripe Elements... Please wait.
          </p>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-500">Connecting to payment servers...</div>
        </div>
      </div>
    )
  }

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready. Please wait a moment and try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card information is required')
      return
    }

    setProcessing(true)
    setCardError('')

    try {
      console.log('💳 Creating payment token...')
      
      // Create token (frontend-only, no backend required)
      const { token, error: tokenError } = await stripe.createToken(cardElement, {
        name: 'Investment Account Funding',
      })
      
      if (tokenError) {
        console.error('❌ Token creation failed:', tokenError.message)
        onError(tokenError.message)
        return
      }

      console.log('✅ Payment token created successfully:', token.id)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Call success handler
      onSuccess({
        id: token.id,
        amount: amount,
        method: 'card',
        status: 'completed',
        token: token,
        last4: token.card?.last4,
        brand: token.card?.brand
      })
      
    } catch (err) {
      console.error('❌ Payment processing error:', err)
      onError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">Secure Payment System Ready</span>
          <Lock className="h-4 w-4 text-green-600" />
        </div>
        <p className="text-sm text-green-700">
          Your payment information is encrypted and secure. Powered by Stripe.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Information
          </label>
          
          {/* CRITICAL: Fixed container with explicit styling */}
          <div 
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ width: '100%' }}>
              <CardElement
                onChange={handleCardChange}
                options={CARD_ELEMENT_OPTIONS}
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Enter your card number, expiry date (MM/YY), and security code (CVC)
          </p>
          {cardError && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {cardError}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Investment Amount:</span>
            <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Processing fee (2.9% + $0.30):</span>
            <span className="text-gray-600 text-sm">${((amount * 0.029) + 0.30).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total charge:</span>
              <span className="font-bold text-gray-900">${(amount + (amount * 0.029) + 0.30).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Investment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Invest ${amount.toLocaleString()} Capital
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure. Powered by Stripe.
        </p>
      </form>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-700">
          <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future date and any 3-digit CVC
        </p>
      </div>
    </div>
  )
}