import React, { useState, useEffect } from 'react'
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, Loader2, Shield, CheckCircle } from 'lucide-react'

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
  
  // Track each element's readiness separately
  const [elementStates, setElementStates] = useState({
    cardNumber: { ready: false, complete: false, error: null, focused: false },
    cardExpiry: { ready: false, complete: false, error: null, focused: false },
    cardCvc: { ready: false, complete: false, error: null, focused: false }
  })

  // Derived values from single state
  const processingFee = investmentAmount * 0.029 + 0.30
  const totalCharge = investmentAmount + processingFee

  // Debug Stripe readiness
  useEffect(() => {
    console.log('🔍 StripeCardFormInner mounted')
    console.log('Stripe instance:', stripe)
    console.log('Elements instance:', elements)
    console.log('window.Stripe:', !!(window as any).Stripe)
    
    if (stripe && elements) {
      console.log('✅ Both Stripe and Elements are ready')
    }
  }, [stripe, elements])

  // Don't render until Stripe is fully ready
  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <div>
          <div className="text-gray-600 font-medium">Loading secure payment system...</div>
          <div className="text-xs text-gray-500 mt-1">
            Stripe: {stripe ? '✅' : '❌'} | Elements: {elements ? '✅' : '❌'}
          </div>
        </div>
      </div>
    )
  }

  // Shared element options
  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
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
  }

  // Element event handlers
  const handleElementChange = (elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc') => (event: any) => {
    console.log(`🔍 ${elementType} changed:`, {
      complete: event.complete,
      error: event.error?.message,
      empty: event.empty,
      brand: event.brand
    })
    
    setElementStates(prev => ({
      ...prev,
      [elementType]: {
        ...prev[elementType],
        complete: event.complete,
        error: event.error?.message || null
      }
    }))
  }

  const handleElementReady = (elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc') => () => {
    console.log(`✅ ${elementType} is ready and mounted - users can now type!`)
    setElementStates(prev => ({
      ...prev,
      [elementType]: {
        ...prev[elementType],
        ready: true
      }
    }))
  }

  const handleElementFocus = (elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc') => () => {
    console.log(`🔍 ${elementType} focused`)
    setElementStates(prev => ({
      ...prev,
      [elementType]: {
        ...prev[elementType],
        focused: true
      }
    }))
  }

  const handleElementBlur = (elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc') => () => {
    console.log(`🔍 ${elementType} blurred`)
    setElementStates(prev => ({
      ...prev,
      [elementType]: {
        ...prev[elementType],
        focused: false
      }
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

    if (!elementStates.cardNumber.complete || !elementStates.cardExpiry.complete || !elementStates.cardCvc.complete) {
      onError('Please complete all card information')
      return
    }

    setLoading(true)

    try {
      console.log('💳 Creating payment intent for amount:', totalCharge)
      
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
      console.log('✅ Payment intent created, confirming payment...')

      // Confirm payment using CardNumberElement
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardNumberElement,
        }
      })

      if (confirmError) {
        console.log('❌ Payment confirmation failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: investmentAmount, // Original investment amount (not including fees)
          method: 'card',
          status: 'completed',
          total_charged: totalCharge
        })
      } else {
        onError('Payment was not completed')
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value) || 0
    console.log('💰 Amount changed:', newAmount)
    setInvestmentAmount(newAmount)
  }

  const allElementsReady = elementStates.cardNumber.ready && elementStates.cardExpiry.ready && elementStates.cardCvc.ready
  const allElementsComplete = elementStates.cardNumber.complete && elementStates.cardExpiry.complete && elementStates.cardCvc.complete
  const hasErrors = elementStates.cardNumber.error || elementStates.cardExpiry.error || elementStates.cardCvc.error
  const isFormValid = allElementsReady && allElementsComplete && !hasErrors && investmentAmount >= 100

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
            onChange={handleAmountChange}
            min="100"
            step="100"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
            placeholder="5000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum investment: $100</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Number Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div 
            className={`border-2 rounded-lg p-4 bg-white transition-colors min-h-[60px] flex items-center ${
              elementStates.cardNumber.complete ? 'border-green-500' : 
              elementStates.cardNumber.error ? 'border-red-500' : 
              elementStates.cardNumber.focused ? 'border-blue-500' :
              'border-gray-300'
            }`}
          >
            <CardNumberElement 
              options={elementOptions}
              onChange={handleElementChange('cardNumber')}
              onReady={handleElementReady('cardNumber')}
              onFocus={handleElementFocus('cardNumber')}
              onBlur={handleElementBlur('cardNumber')}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Test: 4242 4242 4242 4242
            </p>
            <div className="text-xs text-gray-500">
              Ready: {elementStates.cardNumber.ready ? '✅' : '❌'} | 
              Complete: {elementStates.cardNumber.complete ? '✅' : '❌'}
            </div>
          </div>
          {elementStates.cardNumber.error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {elementStates.cardNumber.error}
            </div>
          )}
        </div>

        {/* Card Expiry Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div 
            className={`border-2 rounded-lg p-4 bg-white transition-colors min-h-[60px] flex items-center ${
              elementStates.cardExpiry.complete ? 'border-green-500' : 
              elementStates.cardExpiry.error ? 'border-red-500' : 
              elementStates.cardExpiry.focused ? 'border-blue-500' :
              'border-gray-300'
            }`}
          >
            <CardExpiryElement 
              options={elementOptions}
              onChange={handleElementChange('cardExpiry')}
              onReady={handleElementReady('cardExpiry')}
              onFocus={handleElementFocus('cardExpiry')}
              onBlur={handleElementBlur('cardExpiry')}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Test: 12/34
            </p>
            <div className="text-xs text-gray-500">
              Ready: {elementStates.cardExpiry.ready ? '✅' : '❌'} | 
              Complete: {elementStates.cardExpiry.complete ? '✅' : '❌'}
            </div>
          </div>
          {elementStates.cardExpiry.error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {elementStates.cardExpiry.error}
            </div>
          )}
        </div>

        {/* Card CVC Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Code (CVC)
          </label>
          <div 
            className={`border-2 rounded-lg p-4 bg-white transition-colors min-h-[60px] flex items-center ${
              elementStates.cardCvc.complete ? 'border-green-500' : 
              elementStates.cardCvc.error ? 'border-red-500' : 
              elementStates.cardCvc.focused ? 'border-blue-500' :
              'border-gray-300'
            }`}
          >
            <CardCvcElement 
              options={elementOptions}
              onChange={handleElementChange('cardCvc')}
              onReady={handleElementReady('cardCvc')}
              onFocus={handleElementFocus('cardCvc')}
              onBlur={handleElementBlur('cardCvc')}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Test: 123
            </p>
            <div className="text-xs text-gray-500">
              Ready: {elementStates.cardCvc.ready ? '✅' : '❌'} | 
              Complete: {elementStates.cardCvc.complete ? '✅' : '❌'}
            </div>
          </div>
          {elementStates.cardCvc.error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {elementStates.cardCvc.error}
            </div>
          )}
        </div>

        {/* Investment Summary */}
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

        {/* Debug Status Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-700">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="text-center">
                <div className="font-medium">Card Number</div>
                <div>Ready: {elementStates.cardNumber.ready ? '✅' : '❌'}</div>
                <div>Complete: {elementStates.cardNumber.complete ? '✅' : '❌'}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Expiry</div>
                <div>Ready: {elementStates.cardExpiry.ready ? '✅' : '❌'}</div>
                <div>Complete: {elementStates.cardExpiry.complete ? '✅' : '❌'}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">CVC</div>
                <div>Ready: {elementStates.cardCvc.ready ? '✅' : '❌'}</div>
                <div>Complete: {elementStates.cardCvc.complete ? '✅' : '❌'}</div>
              </div>
            </div>
            <div className="text-center">
              Stripe: {stripe ? '✅' : '❌'} | Elements: {elements ? '✅' : '❌'} | Form Valid: {isFormValid ? '✅' : '❌'}
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