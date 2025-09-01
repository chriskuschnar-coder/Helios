import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { stripeProducts } from '../stripe-config'
import { CreditCard, Loader2, CheckCircle, AlertCircle, DollarSign, Shield } from 'lucide-react'

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

  const handleCheckout = async () => {
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
      console.log('💳 Starting Stripe checkout process for amount:', amount)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      
      if (!supabaseUrl || !anonKey || !stripePublishableKey) {
        console.error('Missing environment variables:', {
          supabaseUrl: !!supabaseUrl,
          anonKey: !!anonKey,
          stripeKey: !!stripePublishableKey
        })
        throw new Error('Payment system not configured - please contact support')
      }

      // Get user session for authentication
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError || !session) {
        console.error('❌ Authentication required for checkout')
        throw new Error('Authentication required - please sign in again')
      }

      console.log('✅ User authenticated, creating checkout session...')
      
      // Create Stripe checkout session via Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          amount: amount * 100,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cancel`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Edge function error:', errorData)
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (!url) {
        throw new Error('No checkout URL received')
      }
      
      console.log('✅ Checkout session created, redirecting to:', url)
      // Redirect to Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('❌ Stripe checkout failed:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
      setLoading(false)
    }
  }

  const onSuccess = (result: any) => {
    setSuccess(true)
    // You could add additional success handling here
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
        onClick={handleCheckout}
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