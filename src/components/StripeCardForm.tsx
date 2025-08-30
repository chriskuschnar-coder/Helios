import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { CARD_ELEMENT_OPTIONS, createPaymentIntent } from '../lib/stripe'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  userId?: string
}

export function StripeCardForm({ amount, onSuccess, onError, userId }: StripeCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [cardError, setCardError] = useState('')
  const [loading, setLoading] = useState(false)
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
      console.log('💳 Creating payment intent for amount:', amount)
      
      // Create payment intent
      const { client_secret, payment_intent_id } = await createPaymentIntent(amount, userId)
      console.log('✅ Payment intent created:', payment_intent_id)

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Investment Account Holder',
          },
        }
      })

      if (confirmError) {
        console.log('❌ Payment confirmation failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back from cents
          method: 'card',
          status: 'completed',
          stripe_payment_intent: paymentIntent
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
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Card Payment</span>
          <Lock className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. Powered by Stripe.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[50px] transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <CardElement
              onChange={handleCardChange}
              options={CARD_ELEMENT_OPTIONS}
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
              Card information is complete
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            Enter your card number, expiry date, and security code
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Funding amount:</span>
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

        <button
          type="submit"
          disabled={!stripe || loading || !cardComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Secure Payment - $${totalCharge.toFixed(2)}`
          )}
        </button>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            <strong>Test Card:</strong> Use 4242 4242 4242 4242 with any future date and any 3-digit CVC
          </p>
        </div>
      </form>
    </div>
  )
}