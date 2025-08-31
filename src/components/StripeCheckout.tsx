import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { stripeProducts } from '../stripe-config'
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface StripeCheckoutProps {
  productId?: string
  className?: string
}

export function StripeCheckout({ productId, className = '' }: StripeCheckoutProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      // Call the Stripe checkout edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cancel`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Successful!</h3>
        <p className="text-green-700">Thank you for your investment. You will receive a confirmation email shortly.</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
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
        disabled={loading || !user}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Creating checkout session...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            {product.mode === 'subscription' ? 'Subscribe Now' : 'Purchase Now'}
          </>
        )}
      </button>

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please sign in to continue with your purchase
        </p>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure payment processing powered by Stripe
        </p>
      </div>
    </div>
  )
}