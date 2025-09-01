import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock } from 'lucide-react'

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo')

interface StripePaymentProps {
  amount: number
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
}

function PaymentForm({ amount, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    const cardElement = elements.getElement(CardElement)
    
    if (!cardElement) {
      setLoading(false)
      return
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (paymentMethodError) {
        onError(paymentMethodError.message || 'Payment method creation failed')
        setLoading(false)
        return
      }

      // For demo purposes, simulate successful payment
      // In production, you'd create a payment intent on your server
      setTimeout(() => {
        onSuccess({
          id: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
          amount: amount * 100, // Stripe uses cents
          status: 'succeeded'
        })
        setLoading(false)
      }, 2000)

    } catch (error) {
      onError('Payment processing failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <span className="text-white font-medium">Card Details</span>
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        <div className="bg-gray-900 rounded p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount to add:</span>
          <span className="text-white font-bold text-lg">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400 text-sm">Processing fee:</span>
          <span className="text-gray-400 text-sm">$0.00</span>
        </div>
        <div className="border-t border-gray-600 mt-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Total:</span>
            <span className="text-white font-bold text-lg">${amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          `Add $${amount.toLocaleString()} to Account`
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your payment information is secure and encrypted. Demo mode - no real charges will be made.
      </p>
    </form>
  )
}

export function StripePayment(props: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}