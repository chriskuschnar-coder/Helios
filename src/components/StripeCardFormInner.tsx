import React, { useState, useEffect } from 'react'
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, Loader2, Shield } from 'lucide-react'

interface StripeCardFormInnerProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardFormInner({ amount: initialAmount, onSuccess, onError, onClose }: StripeCardFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  // Single source of truth for investment amount
  const [investmentAmount, setInvestmentAmount] = useState(initialAmount)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  })
  const [complete, setComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  })

  // Derived values from single state
  const processingFee = investmentAmount * 0.029 + 0.30
  const totalCharge = investmentAmount + processingFee

  // Don't render until Stripe is fully ready
  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading secure payment system...</span>
      </div>
    )
  }

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.5',
        padding: '12px 0',
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
    disabled: false
  }

  const handleElementChange = (elementType: string) => (event: any) => {
    setErrors(prev => ({
      ...prev,
      [elementType]: event.error ? event.error.message : ''
    }))
    
    setComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready')
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      onError('Card information is required')
      return
    }

    setLoading(true)

    try {
      // Create payment intent
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          amount: Math.round(totalCharge * 100), // Convert to cents, including fees
          user_id: 'demo-user'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardNumberElement,
        }
      })

      if (confirmError) {
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess({
          id: paymentIntent.id,
          amount: investmentAmount, // Original investment amount (not including fees)
          method: 'card',
          status: 'completed'
        })
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError('Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = complete.cardNumber && complete.cardExpiry && complete.cardCvc && 
                     !errors.cardNumber && !errors.cardExpiry && !errors.cardCvc &&
                     investmentAmount >= 100

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Investment Processing</span>
          <Lock className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. Powered by bank-level security.
        </p>
      </div>

      {/* Investment Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Investment Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">$</span>
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
            min="100"
            step="100"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
            placeholder="5000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum investment: $100</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div 
            style={{
              border: `2px solid ${complete.cardNumber ? '#10b981' : errors.cardNumber ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.2s ease'
            }}
          >
            <CardNumberElement 
              options={elementOptions}
              onChange={handleElementChange('cardNumber')}
            />
          </div>
          {errors.cardNumber && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.cardNumber}
            </div>
          )}
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div 
              style={{
                border: `2px solid ${complete.cardExpiry ? '#10b981' : errors.cardExpiry ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease'
              }}
            >
              <CardExpiryElement 
                options={elementOptions}
                onChange={handleElementChange('cardExpiry')}
              />
            </div>
            {errors.cardExpiry && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.cardExpiry}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Code
            </label>
            <div 
              style={{
                border: `2px solid ${complete.cardCvc ? '#10b981' : errors.cardCvc ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s ease'
              }}
            >
              <CardCvcElement 
                options={elementOptions}
                onChange={handleElementChange('cardCvc')}
              />
            </div>
            {errors.cardCvc && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.cardCvc}
              </div>
            )}
          </div>
        </div>

        {/* Investment Summary - All values derived from investmentAmount */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Investment Amount:</span>
            <span className="font-bold text-gray-900">${investmentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Processing fee (2.9% + $0.30):</span>
            <span className="text-gray-600 text-sm">${processingFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total charge:</span>
              <span className="font-bold text-gray-900">${totalCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || !isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Investment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Secure Investment - ${investmentAmount.toLocaleString()}
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure. Powered by bank-level security.
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