import React, { useEffect, useState, useRef } from 'react'
import { CreditCard, Lock, AlertCircle, CheckCircle, Shield, X, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

// Your actual publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose?: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  const stripeRef = useRef<any>(null)
  const elementsRef = useRef<any>(null)
  const cardElementRef = useRef<any>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const initializeStripe = async () => {
      try {
        console.log('🔄 Starting Stripe initialization...')
        
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && isLoading) {
            console.error('❌ Stripe initialization timeout')
            setError('Payment system took too long to load. Please refresh the page.')
            setIsLoading(false)
          }
        }, 10000) // 10 second timeout

        // Check if Stripe is already available globally
        if (window.Stripe) {
          console.log('✅ Stripe already available globally')
          setupStripeElements()
        } else {
          console.log('📦 Loading Stripe script...')
          
          // Load Stripe script dynamically
          const script = document.createElement('script')
          script.src = 'https://js.stripe.com/v3/'
          script.async = true
          script.onload = () => {
            console.log('✅ Stripe script loaded successfully')
            if (mounted) {
              setupStripeElements()
            }
          }
          script.onerror = () => {
            console.error('❌ Failed to load Stripe script')
            if (mounted) {
              setError('Failed to load payment system. Please check your internet connection.')
              setIsLoading(false)
            }
          }
          document.head.appendChild(script)
        }
      } catch (err) {
        console.error('❌ Stripe initialization error:', err)
        if (mounted) {
          setError('Failed to initialize payment system')
          setIsLoading(false)
        }
      }
    }

    const setupStripeElements = () => {
      try {
        console.log('🔧 Setting up Stripe Elements...')
        
        // Initialize Stripe with publishable key
        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY)
        if (!stripe) {
          throw new Error('Failed to initialize Stripe')
        }
        
        stripeRef.current = stripe
        console.log('✅ Stripe instance created')
        
        // Create Elements instance
        const elements = stripe.elements()
        elementsRef.current = elements
        console.log('✅ Elements instance created')
        
        // Create Card Element with enhanced styling
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
            }
          },
          hidePostalCode: false
        })
        
        cardElementRef.current = cardElement
        console.log('✅ Card element created')
        
        // Wait for DOM to be ready, then mount
        setTimeout(() => {
          if (mounted && !mountedRef.current) {
            const container = document.getElementById('stripe-card-element')
            if (container) {
              console.log('📍 Mounting card element to container')
              cardElement.mount('#stripe-card-element')
              mountedRef.current = true
              
              // Set up event listeners
              cardElement.on('ready', () => {
                console.log('✅ Card element is ready for input')
                clearTimeout(timeoutId)
                if (mounted) {
                  setCardReady(true)
                  setIsLoading(false)
                }
              })
              
              cardElement.on('change', (event: any) => {
                console.log('💳 Card change event:', event)
                if (mounted) {
                  if (event.error) {
                    setError(event.error.message)
                  } else {
                    setError('')
                  }
                }
              })
              
            } else {
              console.error('❌ Card element container not found')
              setError('Payment form container not found')
              setIsLoading(false)
            }
          }
        }, 200) // Small delay to ensure DOM is ready
        
      } catch (err) {
        console.error('❌ Stripe setup error:', err)
        if (mounted) {
          setError('Failed to setup payment form: ' + err.message)
          setIsLoading(false)
        }
      }
    }

    initializeStripe()

    // Cleanup function
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      if (cardElementRef.current && mountedRef.current) {
        try {
          cardElementRef.current.destroy()
          console.log('🧹 Card element destroyed')
        } catch (e) {
          console.log('Card element already destroyed')
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripeRef.current || !cardElementRef.current) {
      setError('Payment system not ready. Please wait...')
      return
    }

    if (amount < 100) {
      setError('Minimum funding amount is $100')
      return
    }

    setProcessing(true)
    setError('')

    try {
      console.log('💳 Creating payment token for amount:', amount)
      
      // For demo purposes, create a token instead of payment intent
      // This doesn't require a backend and will work in any environment
      const { token, error: tokenError } = await stripeRef.current.createToken(cardElementRef.current, {
        name: user?.email || 'Demo User',
        address_line1: '123 Investment Street',
        address_city: 'New York',
        address_state: 'NY',
        address_zip: '10001',
        address_country: 'US',
      })

      if (tokenError) {
        console.log('❌ Token creation failed:', tokenError)
        setError(tokenError.message || 'Payment failed')
      } else {
        console.log('✅ Token created successfully:', token.id)
        
        // Simulate successful payment processing
        onSuccess({
          id: token.id,
          amount: amount,
          method: 'card',
          status: 'completed',
          stripe_token: token.id,
          card_last4: token.card?.last4,
          card_brand: token.card?.brand
        })
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      setError(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  // Loading state while Stripe initializes
  if (isLoading) {
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
        <p className="text-xs text-gray-400 mt-4">
          If this takes more than 10 seconds, please refresh the page
        </p>
      </div>
    )
  }

  // Error state
  if (error && !cardReady) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment System Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="block mx-auto text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
          )}
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
          
          {/* Stripe Card Element Container */}
          <div className="border-2 border-gray-300 rounded-xl p-4 bg-white transition-all duration-300 min-h-[60px] flex items-center">
            <div 
              id="stripe-card-element" 
              className="w-full"
              style={{ minHeight: '42px' }}
            >
              {/* Stripe Card Element will be mounted here */}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Enter your card number, expiry date (MM/YY), and security code (CVC)
            </p>
            {cardReady && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Card ready
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-3 text-sm text-red-600 flex items-center bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!cardReady || processing}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden
            ${processing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : !cardReady
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 hover:shadow-lg hover:shadow-navy-500/25 hover:-translate-y-0.5 text-white'
            }
          `}
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              Processing Investment...
            </div>
          ) : !cardReady ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              Initializing Payment...
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