import React, { useEffect, useState } from 'react'
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

// Declare Stripe types for TypeScript
declare global {
  interface Window {
    Stripe: any
  }
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [stripeReady, setStripeReady] = useState(false)
  const [stripe, setStripe] = useState<any>(null)
  const [cardElement, setCardElement] = useState<any>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    console.log('🔍 StripeCardForm: Starting initialization...')
    
    // Step 1: Check if script is already loaded
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.stripe.com/v3/"]'
    )
    
    if (script?.getAttribute('data-loaded') === 'true') {
      console.log('✅ Stripe script already loaded')
      setScriptLoaded(true)
      initializeStripe()
      return
    }

    // Step 2: Wait for script to load
    const handleScriptLoad = () => {
      console.log('✅ Stripe script loaded via event listener')
      setScriptLoaded(true)
      initializeStripe()
    }

    if (script) {
      script.addEventListener('load', handleScriptLoad)
      
      // Cleanup
      return () => {
        script.removeEventListener('load', handleScriptLoad)
      }
    } else {
      console.error('❌ Stripe script tag not found in DOM')
      setError('Payment system script not found. Please refresh the page.')
    }
  }, [])

  const initializeStripe = () => {
    console.log('🔄 Initializing Stripe...')
    
    // Step 3: Check if window.Stripe is available
    if (!window.Stripe) {
      console.warn('⚠️ window.Stripe not available yet, retrying...')
      
      // Retry with exponential backoff
      let attempts = 0
      const maxAttempts = 20
      
      const checkStripe = () => {
        attempts++
        console.log(`🔍 Checking for window.Stripe... attempt ${attempts}`)
        
        if (window.Stripe) {
          console.log('✅ window.Stripe found!')
          setupStripeElements()
        } else if (attempts < maxAttempts) {
          console.log(`⏳ Retrying in ${attempts * 100}ms...`)
          setTimeout(checkStripe, attempts * 100) // Exponential backoff
        } else {
          console.error('❌ window.Stripe failed to load after maximum attempts')
          setError('Payment system failed to initialize. Please refresh the page.')
        }
      }
      
      checkStripe()
    } else {
      console.log('✅ window.Stripe immediately available')
      setupStripeElements()
    }
  }

  const setupStripeElements = () => {
    try {
      console.log('🎯 Setting up Stripe elements...')
      
      // Step 4: Initialize Stripe with public key
      const stripeInstance = window.Stripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')
      
      if (!stripeInstance) {
        throw new Error('Failed to initialize Stripe instance')
      }
      
      setStripe(stripeInstance)
      console.log('✅ Stripe instance created')
      
      // Step 5: Create Elements
      const elements = stripeInstance.elements()
      const card = elements.create('card', {
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
      })
      
      setCardElement(card)
      console.log('✅ Card element created')
      
      // Step 6: Mount card element
      setTimeout(() => {
        const container = document.getElementById('stripe-card-element')
        if (container) {
          card.mount('#stripe-card-element')
          console.log('🎯 Card element mounted to DOM')
          
          card.on('ready', () => {
            console.log('✅ Card element ready for input!')
            setStripeReady(true)
          })
          
          card.on('change', (event: any) => {
            if (event.error) {
              setError(event.error.message)
            } else {
              setError('')
            }
          })
          
          card.on('focus', () => {
            console.log('👆 Card element focused')
          })
          
        } else {
          console.error('❌ Card container element not found')
          setError('Payment form container not found')
        }
      }, 100) // Small delay to ensure DOM is ready
      
    } catch (err) {
      console.error('❌ Stripe setup error:', err)
      setError('Failed to initialize payment system: ' + (err as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('💳 Processing payment...')
    
    // Step 7: Validate Stripe is ready
    if (!stripe || !cardElement || !stripeReady) {
      const errorMsg = 'Payment system not ready. Please wait a moment and try again.'
      console.error('❌ ' + errorMsg)
      setError(errorMsg)
      return
    }

    setProcessing(true)
    setError('')

    try {
      console.log('🔄 Creating payment token...')
      
      // Step 8: Create token (frontend-only, no backend required)
      const { token, error: tokenError } = await stripe.createToken(cardElement, {
        name: 'Investment Account Funding',
        address_line1: 'Investment Address',
        address_city: 'Investment City',
        address_state: 'Investment State',
        address_zip: '12345',
        address_country: 'US',
      })
      
      if (tokenError) {
        console.error('❌ Token creation failed:', tokenError.message)
        setError(tokenError.message)
        return
      }

      console.log('✅ Payment token created successfully:', token.id)
      
      // Step 9: Simulate processing delay (replace with real payment processing)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 10: Call success handler
      onSuccess({
        id: token.id,
        amount: amount,
        method: 'card',
        status: 'completed',
        token: token,
        last4: token.card.last4,
        brand: token.card.brand
      })
      
    } catch (err) {
      console.error('❌ Payment processing error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Loading state while Stripe initializes
  if (!scriptLoaded || !stripeReady) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="font-medium text-blue-900">Loading Secure Payment System</span>
          </div>
          <p className="text-sm text-blue-700">
            {!scriptLoaded ? 'Loading Stripe.js from CDN...' : 'Initializing payment form...'}
          </p>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Connecting to secure payment servers...
        </p>
      </div>
    )
  }

  // Error state
  if (error && !stripeReady) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Payment System Error</span>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main payment form (only shows when Stripe is fully ready)
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
          <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[60px] flex items-center">
            <div className="w-full">
              <div 
                id="stripe-card-element" 
                className="w-full"
                style={{ minHeight: '42px' }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter your card number, expiry date (MM/YY), and security code (CVC)
          </p>
          {error && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
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
          disabled={!stripeReady || processing}
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