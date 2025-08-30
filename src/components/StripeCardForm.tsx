import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: '1.5',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
    complete: {
      color: '#059669',
    },
  },
  hidePostalCode: true,
}

export function StripeCardForm({ amount, onSuccess, onError }: StripeCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')
  const [cardComplete, setCardComplete] = useState(false)

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError('')
    }
    setCardComplete(event.complete)
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

    setLoading(true)
    setCardError('')

    try {
      console.log('💳 Processing payment for amount:', amount)
      
      // Create payment intent via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to cents
          user_id: 'demo-user' // In production, get from auth context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      console.log('✅ Payment intent created')

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Investment Account Holder',
          },
        }
      })

      if (confirmError) {
        console.log('❌ Payment failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back from cents
          method: 'card',
          status: 'completed'
        })
      } else {
        onError('Payment was not completed successfully')
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  const processingFee = (amount * 0.029) + 0.30
  const totalCharge = amount + processingFee

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Secure Card Payment</span>
          <Lock className="h-3 w-3 text-blue-600" />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[50px] transition-colors focus-within:border-blue-500">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
          
          {cardError && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {cardError}
            </div>
          )}
          
          {cardComplete && !cardError && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Card information complete
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-700 text-sm">Amount:</span>
            <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 text-xs">Processing fee:</span>
            <span className="text-gray-600 text-xs">${processingFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 text-sm">Total:</span>
              <span className="font-bold text-gray-900">${totalCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || !cardComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Processing Payment...' : `Pay $${totalCharge.toFixed(2)}`}
        </button>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-700">
            <strong>Test:</strong> Use 4242 4242 4242 4242 with any future date and CVC
          </p>
        </div>
      </form>
    </div>
  )
}