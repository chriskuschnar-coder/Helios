import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Shield, Lock, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface EmbeddedStripeFormProps {
  amount: number
  clientSecret: string
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

export function EmbeddedStripeForm({ amount, clientSecret, onSuccess, onError }: EmbeddedStripeFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentReady, setPaymentReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('💳 Processing payment...')
      
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/funding-success`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!')
        onSuccess(paymentIntent)
      }

    } catch (error) {
      console.error('❌ Payment failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      onError(errorMessage)
      setLoading(false)
    }
  }

  const processingFee = amount * 0.029 + 0.30
  const totalCharge = amount + processingFee

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">Live Payment Processing</span>
          <Lock className="h-4 w-4 text-green-600" />
        </div>
        <p className="text-sm text-green-700">
          <strong>LIVE MODE:</strong> Your payment information is encrypted and processed securely by Stripe. Real charges will be made.
        </p>
      </div>

      {/* Stripe Payment Element - This is the embedded form */}
      <div className="space-y-4">
        <PaymentElement 
          onReady={() => setPaymentReady(true)}
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: user?.email
              }
            }
          }}
        />
      </div>

      {/* Amount Summary */}
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-900 font-medium">{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !paymentReady}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Investment - ${amount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  )
}