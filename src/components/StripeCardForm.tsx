import React, { useEffect, useState } from 'react'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

export function StripeCardForm({ amount, onSuccess, onError, onClose }: StripeCardFormProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [stripe, setStripe] = useState<any>(null)
  const [cardElement, setCardElement] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    let checkCount = 0
    const maxChecks = 50 // 10 seconds max wait

    const checkStripe = () => {
      checkCount++
      console.log(`🔍 Checking for Stripe... attempt ${checkCount}`)
      
      if ((window as any).Stripe) {
        console.log('✅ Stripe found! Initializing...')
        
        try {
          const stripeInstance = (window as any).Stripe('pk_test_51S25DbFhEA0kH7xcn7HrWHyUNUgJfFaYiYmnAMLhBZeWE1fU9TLhiKKh6bTvJz3LF68E9qAokVRBJMHLWkiPWUR000jCr1fLmH')
          setStripe(stripeInstance)
          
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
          
          // Wait a bit for DOM to be ready
          setTimeout(() => {
            if (mounted) {
              const container = document.getElementById('stripe-card-element')
              if (container) {
                card.mount('#stripe-card-element')
                console.log('🎯 Card element mounted successfully')
                
                card.on('ready', () => {
                  console.log('✅ Card element ready!')
                  if (mounted) {
                    setIsReady(true)
                  }
                })
                
                card.on('change', (event: any) => {
                  if (mounted) {
                    if (event.error) {
                      setError(event.error.message)
                    } else {
                      setError('')
                    }
                  }
                })
              } else {
                console.error('❌ Card container not found')
                setError('Payment form container not found')
              }
            }
          }, 100)
          
        } catch (err) {
          console.error('❌ Stripe initialization error:', err)
          setError('Failed to initialize payment system')
        }
      } else if (checkCount < maxChecks) {
        console.log(`⏳ Stripe not ready yet, retrying in 200ms...`)
        setTimeout(checkStripe, 200)
      } else {
        console.error('❌ Stripe failed to load after maximum attempts')
        setError('Payment system failed to load. Please refresh the page.')
      }
    }

    checkStripe()

    return () => {
      mounted = false
      if (cardElement) {
        try {
          cardElement.destroy()
          console.log('🧹 Card element destroyed')
        } catch (e) {
          console.log('Card element already destroyed')
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !cardElement) {
      setError('Payment system not ready')
      return
    }

    if (!isReady) {
      setError('Please wait for the payment form to load')
      return
    }

    setProcessing(true)
    setError('')

    try {
      console.log('💳 Processing payment for amount:', amount)
      
      // Create token (works without backend)
      const { token, error: tokenError } = await stripe.createToken(cardElement)
      
      if (tokenError) {
        console.error('❌ Token creation failed:', tokenError.message)
        setError(tokenError.message)
        return
      }

      console.log('✅ Token created successfully:', token.id)
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call success handler
      onSuccess({
        id: token.id,
        amount: amount,
        method: 'card',
        status: 'completed',
        token: token
      })
      
    } catch (err) {
      console.error('❌ Payment processing error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Loading state
  if (!isReady && !error) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Secure Card Payment</span>
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700">
            Initializing secure payment system...
          </p>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Loading payment form... Please wait.
        </p>
      </div>
    )
  }

  // Error state
  if (error && !isReady) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">Payment System Error</span>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // Main payment form
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Card Payment</span>
          <Lock className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. Powered by bank-level security.
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
            <span className="text-gray-700">Amount:</span>
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
          disabled={!isReady || processing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Invest ${amount.toLocaleString()} Capital
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure.
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