import React, { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle, Shield, X, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

// Use your working Stripe sandbox keys
const stripePublishableKey = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

console.log('🔍 Stripe Configuration:')
console.log('Publishable Key:', stripePublishableKey ? 'Loaded ✅' : 'Missing ❌')
console.log('Key starts with:', stripePublishableKey.substring(0, 12) + '...')

// Initialize Stripe immediately
const stripePromise = loadStripe(stripePublishableKey)

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose?: () => void
}

// Enhanced Stripe CardElement options for better rendering
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      lineHeight: '1.5',
      '::placeholder': {
        color: '#9ca3af'
      },
      ':-webkit-autofill': {
        color: '#1f2937'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    },
    complete: {
      color: '#059669',
      iconColor: '#059669'
    }
  },
  hidePostalCode: false,
  iconStyle: 'solid' as const,
  disabled: false
}

function CardPaymentForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const cardElementRef = useRef<HTMLDivElement>(null)
  
  // Enhanced state management
  const [stripeReady, setStripeReady] = useState(false)
  const [cardError, setCardError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cardFocused, setCardFocused] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardEmpty, setCardEmpty] = useState(true)
  const [cardValid, setCardValid] = useState(false)
  const [elementMounted, setElementMounted] = useState(false)

  // Initialize Stripe Elements
  useEffect(() => {
    console.log('🔄 Stripe initialization check:')
    console.log('Stripe object:', !!stripe)
    console.log('Elements object:', !!elements)
    
    if (stripe && elements) {
      setStripeReady(true)
      console.log('✅ Stripe and Elements loaded successfully')
      
      // Ensure card element is properly mounted
      const cardElement = elements.getElement(CardElement)
      if (cardElement && cardElementRef.current) {
        console.log('✅ Card element found and container ready')
        setElementMounted(true)
      }
    } else {
      console.log('⏳ Waiting for Stripe to load...')
      console.log('Stripe promise state:', stripePromise)
    }
  }, [stripe, elements])

  // Enhanced card change handler
  const handleCardChange = (event: any) => {
    console.log('💳 Card change event:', {
      complete: event.complete,
      empty: event.empty,
      error: event.error?.message,
      brand: event.brand
    })
    
    setCardComplete(event.complete)
    setCardEmpty(event.empty)
    setCardValid(event.complete && !event.error)
    
    if (event.error) {
      setCardError(event.error.message)
      console.log('❌ Card validation error:', event.error.message)
    } else {
      setCardError('')
      if (event.complete) {
        console.log('✅ Card information complete and valid')
      }
    }
  }

  const handleCardFocus = () => {
    setCardFocused(true)
    console.log('💳 Card element focused')
  }

  const handleCardBlur = () => {
    setCardFocused(false)
    console.log('💳 Card element blurred')
  }

  const handleCardReady = () => {
    console.log('💳 Card element ready for input')
    setElementMounted(true)
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

    if (amount < 100) {
      onError('Minimum funding amount is $100')
      return
    }

    if (!cardComplete || !cardValid) {
      onError('Please complete your card information')
      return
    }

    setLoading(true)
    setCardError('')

    try {
      console.log('💳 Creating payment intent for amount:', amount)
      
      // Create payment intent via local API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to cents
          user_id: user?.id || 'demo-user'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      console.log('✅ Payment intent created successfully')

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email || 'demo@globalmarket.com',
          }
        }
      })

      if (confirmError) {
        console.log('❌ Payment failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          method: 'card',
          status: 'completed',
          stripe_payment_intent: paymentIntent.id
        })
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  // Loading state while Stripe initializes
  if (!stripeReady || !elementMounted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Secure Payment System</h3>
        <p className="text-gray-600 mb-4">Connecting to Stripe...</p>
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-500">Bank-level security</span>
        </div>
        <div className="mt-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    )
  }

  const processingFee = (amount * 0.029) + 0.30
  const totalCharge = amount + processingFee

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Fund Trading Account</h3>
                <p className="text-blue-100 text-sm">Add funds to start trading instantly</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Bank-level Security</span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Summary */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-navy-600" />
            Capital Investment Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Investment amount:</span>
              <span className="font-bold text-gray-900 text-xl">${amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Processing fee (2.9% + $0.30):</span>
              <span className="text-gray-600 text-sm">${processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Fund:</span>
              <span className="text-gray-700 text-sm font-medium">Global Market Consulting Fund</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total charge:</span>
                <span className="font-bold text-gray-900 text-xl">${totalCharge.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Information Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Payment Information
          </label>
          
          {/* Enhanced Card Element Container */}
          <div 
            ref={cardElementRef}
            className={`
              border-2 rounded-xl p-4 bg-white transition-all duration-300 min-h-[60px] flex items-center
              ${cardFocused ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 
                cardError ? 'border-red-500 shadow-lg shadow-red-500/10' : 
                cardComplete ? 'border-green-500 shadow-lg shadow-green-500/10' : 
                'border-gray-300 hover:border-gray-400'}
            `}
          >
            <div className="w-full">
              <CardElement
                onChange={handleCardChange}
                onFocus={handleCardFocus}
                onBlur={handleCardBlur}
                onReady={handleCardReady}
                options={CARD_ELEMENT_OPTIONS}
              />
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Enter your card number, expiry date (MM/YY), and security code (CVC)
            </p>
            {cardComplete && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Card valid
              </div>
            )}
          </div>
          
          {cardError && (
            <div className="mt-3 text-sm text-red-600 flex items-center bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {cardError}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || loading || !cardComplete || !cardValid}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : (!cardComplete || !cardValid)
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 hover:shadow-lg hover:shadow-navy-500/25 hover:-translate-y-0.5 text-white'
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              Processing Investment...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2" />
              Invest ${amount.toLocaleString()} Capital
            </div>
          )}
        </button>

        {/* Test Card Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="font-medium text-yellow-800">Test Mode Active</span>
          </div>
          <p className="text-sm text-yellow-700">
            <strong>Test Card:</strong> Use <code className="bg-yellow-100 px-2 py-1 rounded font-mono">4242 4242 4242 4242</code> with any future date and any 3-digit CVC
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            Other test cards: <code className="font-mono">4000 0000 0000 0002</code> (declined), <code className="font-mono">4000 0025 0000 3155</code> (3D Secure)
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>PCI Compliant</span>
          </div>
          <div className="text-sm text-gray-500">
            Powered by <strong className="text-gray-700">Stripe</strong>
          </div>
        </div>
      </form>
    </div>
  )
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false)
  const [stripeError, setStripeError] = useState('')

  useEffect(() => {
    console.log('🔍 Initializing Stripe promise...')
    
    // Check if Stripe is properly loaded
    stripePromise
      .then((stripe) => {
        if (stripe) {
          console.log('✅ Stripe loaded successfully')
          console.log('Stripe object methods:', Object.keys(stripe))
          setStripeLoaded(true)
        } else {
          console.error('❌ Failed to load Stripe - null returned')
          setStripeError('Failed to load payment system. Please check your internet connection.')
        }
      })
      .catch((error) => {
        console.error('❌ Stripe loading error:', error)
        setStripeError('Payment system unavailable. Please try again later.')
      })
  }, [])

  if (stripeError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment System Error</h3>
        <p className="text-gray-600 mb-4">{stripeError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stripeLoaded) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Secure Payment System</h3>
        <p className="text-gray-600 mb-4">Connecting to Stripe...</p>
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-500">Bank-level security</span>
        </div>
        <div className="mt-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CardPaymentForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError}
        onClose={onClose}
      />
    </Elements>
  )
}