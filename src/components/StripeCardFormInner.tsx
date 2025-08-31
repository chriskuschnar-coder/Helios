import React, { useState, useEffect } from 'react'
import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, Loader2, Shield } from 'lucide-react'

interface StripeCardFormInnerProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardFormInner({ amount, onSuccess, onError, onClose }: StripeCardFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Track each element's state separately - CRITICAL for debugging
  const [cardNumberReady, setCardNumberReady] = useState(false)
  const [cardExpiryReady, setCardExpiryReady] = useState(false)
  const [cardCvcReady, setCardCvcReady] = useState(false)
  
  const [cardNumberComplete, setCardNumberComplete] = useState(false)
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false)
  const [cardCvcComplete, setCardCvcComplete] = useState(false)
  
  const [cardNumberError, setCardNumberError] = useState<string | null>(null)
  const [cardExpiryError, setCardExpiryError] = useState<string | null>(null)
  const [cardCvcError, setCvcError] = useState<string | null>(null)

  // Calculate fees
  const processingFee = amount * 0.029 + 0.30
  const totalCharge = amount + processingFee

  useEffect(() => {
    console.log('🔍 StripeCardFormInner mounted')
    console.log('Stripe instance:', !!stripe)
    console.log('Elements instance:', !!elements)
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

  // CRITICAL: Container style for proper iframe mounting
  const boxStyle: React.CSSProperties = {
    minHeight: '56px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    zIndex: 10,
    position: 'relative',
    pointerEvents: 'auto'
  }

  // CRITICAL: Element options with disabled: false
  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.025em',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    disabled: false // CRITICAL: Ensure elements are interactive
  }

  // Element event handlers
  const handleCardNumberChange = (event: any) => {
    console.log('🔍 Card number changed:', { complete: event.complete, error: event.error?.message })
    setCardNumberComplete(event.complete)
    setCardNumberError(event.error?.message || null)
    if (event.error) {
      setError(event.error.message)
    } else if (!event.complete) {
      setError(null)
    }
  }

  const handleCardExpiryChange = (event: any) => {
    console.log('🔍 Card expiry changed:', { complete: event.complete, error: event.error?.message })
    setCardExpiryComplete(event.complete)
    setCardExpiryError(event.error?.message || null)
    if (event.error) {
      setError(event.error.message)
    } else if (!event.complete) {
      setError(null)
    }
  }

  const handleCardCvcChange = (event: any) => {
    console.log('🔍 Card CVC changed:', { complete: event.complete, error: event.error?.message })
    setCardCvcComplete(event.complete)
    setCvcError(event.error?.message || null)
    if (event.error) {
      setError(event.error.message)
    } else if (!event.complete) {
      setError(null)
    }
  }

  // CRITICAL: onReady callbacks to track mounting
  const handleCardNumberReady = () => {
    console.log('✅ Card number element ready and mounted - users can now type!')
    setCardNumberReady(true)
  }

  const handleCardExpiryReady = () => {
    console.log('✅ Card expiry element ready and mounted - users can now type!')
    setCardExpiryReady(true)
  }

  const handleCardCvcReady = () => {
    console.log('✅ Card CVC element ready and mounted - users can now type!')
    setCardCvcReady(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready')
      return
    }

    // CRITICAL: Only get CardNumberElement - Stripe automatically gets the others
    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      onError('Card information is required')
      return
    }

    if (!cardNumberComplete || !cardExpiryComplete || !cardCvcComplete) {
      onError('Please complete all card information')
      return
    }

    setLoading(true)
    setError(null)

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

      // CRITICAL: Only pass CardNumberElement - Stripe gets expiry and CVC automatically
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardNumberElement, // Only pass CardNumberElement!
        }
      })

      if (confirmError) {
        console.log('❌ Payment confirmation failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: amount, // Original investment amount (not including fees)
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

  const allElementsReady = cardNumberReady && cardExpiryReady && cardCvcReady
  const allElementsComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete
  const hasErrors = cardNumberError || cardExpiryError || cardCvcError
  const isFormValid = allElementsReady && allElementsComplete && !hasErrors && amount >= 100

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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Number Field - CRITICAL: Proper container for Stripe iframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ pointerEvents: 'none' }}>
            Card Number
          </label>
          <div 
            style={{
              ...boxStyle,
              borderColor: cardNumberComplete ? '#10b981' : cardNumberError ? '#ef4444' : '#d1d5db'
            }}
          >
            <CardNumberElement 
              options={{
                ...elementOptions,
                placeholder: '4242 4242 4242 4242'
              }}
              onChange={handleCardNumberChange}
              onReady={handleCardNumberReady}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Test: 4242 4242 4242 4242
            </p>
            <div className="text-xs text-gray-500">
              Ready: {cardNumberReady ? '✅' : '❌'} | Complete: {cardNumberComplete ? '✅' : '❌'}
            </div>
          </div>
          {cardNumberError && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {cardNumberError}
            </div>
          )}
        </div>

        {/* Card Expiry and CVC in same row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card Expiry Field - CRITICAL: Proper container for Stripe iframe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ pointerEvents: 'none' }}>
              Expiry Date
            </label>
            <div 
              style={{
                ...boxStyle,
                borderColor: cardExpiryComplete ? '#10b981' : cardExpiryError ? '#ef4444' : '#d1d5db'
              }}
            >
              <CardExpiryElement 
                options={elementOptions}
                onChange={handleCardExpiryChange}
                onReady={handleCardExpiryReady}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Test: 12/34
              </p>
              <div className="text-xs text-gray-500">
                Ready: {cardExpiryReady ? '✅' : '❌'} | Complete: {cardExpiryComplete ? '✅' : '❌'}
              </div>
            </div>
            {cardExpiryError && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {cardExpiryError}
              </div>
            )}
          </div>

          {/* Card CVC Field - CRITICAL: Proper container for Stripe iframe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ pointerEvents: 'none' }}>
              Security Code
            </label>
            <div 
              style={{
                ...boxStyle,
                borderColor: cardCvcComplete ? '#10b981' : cardCvcError ? '#ef4444' : '#d1d5db'
              }}
            >
              <CardCvcElement 
                options={elementOptions}
                onChange={handleCardCvcChange}
                onReady={handleCardCvcReady}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Test: 123
              </p>
              <div className="text-xs text-gray-500">
                Ready: {cardCvcReady ? '✅' : '❌'} | Complete: {cardCvcComplete ? '✅' : '❌'}
              </div>
            </div>
            {cardCvcError && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {cardCvcError}
              </div>
            )}
          </div>
        </div>

        {/* Investment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Investment Amount:</span>
            <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
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

        {/* Debug Status Panel - Shows real-time element status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-700">
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="text-center">
                <div className="font-medium">Card Number</div>
                <div>Ready: {cardNumberReady ? '✅' : '❌'}</div>
                <div>Complete: {cardNumberComplete ? '✅' : '❌'}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Expiry</div>
                <div>Ready: {cardExpiryReady ? '✅' : '❌'}</div>
                <div>Complete: {cardExpiryComplete ? '✅' : '❌'}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">CVC</div>
                <div>Ready: {cardCvcReady ? '✅' : '❌'}</div>
                <div>Complete: {cardCvcComplete ? '✅' : '❌'}</div>
              </div>
            </div>
            <div className="text-center">
              Stripe: {stripe ? '✅' : '❌'} | Elements: {elements ? '✅' : '❌'} | Form Valid: {isFormValid ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

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
              Secure Investment - ${amount.toLocaleString()}
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