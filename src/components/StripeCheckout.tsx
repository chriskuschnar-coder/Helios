import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { stripeProducts } from '../stripe-config'
import { CreditCard, Loader2, CheckCircle, AlertCircle, DollarSign, Shield } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe('pk_live_51S2OIF3aD6OJYuckOW7RhBZ9xG0fHNkFSKCYVeRBjFMeusz0P9tSIvRyja7LY55HHhuhrgc5UZR6v78SrM9CE25300XPf5I5z4')

function PaymentForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready')
      return
    }

    setLoading(true)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/funding-success`,
        },
        redirect: 'if_required'
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!')
        onSuccess(paymentIntent)
      }

    } catch (error) {
      console.error('❌ Payment failed:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
      setLoading(false)
    }
  }

  const processingFee = amount * 0.029 + 0.30
  const totalCharge = amount + processingFee

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Live Payment Processing</span>
        </div>
        <p className="text-sm text-blue-700">
          Your payment will be processed securely. Real charges will be made to your card.
        </p>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />

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

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg"
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
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-900 text-sm">Live Payment Processing</span>
        </div>
        <p className="text-xs text-green-700">
          <strong>Live Mode:</strong> Real payments will be processed. Your card will be charged.
        </p>
      </div>
    </form>
  )
}
interface StripeCheckoutProps {
  productId?: string
  className?: string
  customAmount?: number
}

export function StripeCheckout({ productId, className = '', customAmount }: StripeCheckoutProps) {
  const { user, processFunding } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState(customAmount || 10000) // Default $100
  const [success, setSuccess] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Find the product or use the first one as default
  const product = productId 
    ? stripeProducts.find(p => p.id === productId) 
    : stripeProducts[0]

  if (!product) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-900 font-medium">Product not found</span>
        </div>
      </div>
    )
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setAmount(Math.max(100, value)) // Minimum $100
  }

  const handleProceedToPayment = async () => {
    if (!user) {
      setError('Please sign in to continue')
      return
    }

    if (amount < 100) {
      setError('Minimum investment amount is $100')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('💳 Creating payment intent for amount:', amount)
      
      const supabaseUrl = 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          user_id: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      setClientSecret(client_secret)
      setShowPaymentForm(true)
      console.log('✅ Payment intent created successfully')
      
    } catch (error) {
      console.error('❌ Payment intent creation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize payment')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (result: any) => {
    setSuccess(true)
    setShowPaymentForm(false)
    // Refresh account data
    window.location.reload()
  }

  const handlePaymentError = (error: string) => {
    setError(error)
    setLoading(false)
  }

  if (success) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Investment Successful!</h3>
          <p className="text-green-700 mb-4">
            ${amount.toLocaleString()} has been added to your account
          </p>
        </div>
      </div>
    )
  }

  if (showPaymentForm) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <button
          onClick={() => setShowPaymentForm(false)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
        >
          ← Back to Investment Amount
        </button>
        
        {clientSecret ? (
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#1e40af',
                  colorBackground: '#ffffff',
                  colorText: '#1f2937',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                }
              }
            }}
          >
            <PaymentForm 
              amount={amount} 
              onSuccess={handlePaymentSuccess} 
              onError={handlePaymentError} 
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Initializing secure payment...</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Investment Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">$</span>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-lg font-semibold"
            placeholder="Enter amount"
            min="100"
            step="100"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum investment: $100</p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[1000, 5000, 10000, 25000].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => setAmount(quickAmount)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-navy-500 hover:bg-navy-50 transition-colors"
          >
            ${quickAmount.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Payment Processing</span>
        </div>
        <p className="text-sm text-blue-700">
          Payments are processed securely through Stripe. You'll be redirected to Stripe's secure checkout page.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-900 font-medium">{error}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleProceedToPayment}
        disabled={loading || !user || amount < 100}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Creating Secure Checkout...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Invest ${amount.toLocaleString()} Securely
          </>
        )}
      </button>

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please sign in to continue with your investment
        </p>
      )}
    </div>
  )
}