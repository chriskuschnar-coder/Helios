import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6')

interface CheckoutButtonProps {
  amount: number
  onSuccess?: () => void
  className?: string
  children?: React.ReactNode
}

export function CheckoutButton({ amount, onSuccess, className, children }: CheckoutButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in to invest')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🛒 Creating checkout session for amount:', amount)
      
      // Create checkout session via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: amount,
          user_id: user.id,
          user_email: user.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create checkout session')
      }

      const { id: sessionId, url: checkoutUrl } = await response.json()
      console.log('✅ Checkout session created:', sessionId)

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Redirect to checkout
      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: sessionId
      })

      if (redirectError) {
        throw new Error(redirectError.message)
      }

    } catch (error) {
      console.error('❌ Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating secure checkout...
          </>
        ) : (
          children || (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Invest ${amount.toLocaleString()}
            </>
          )
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Secure payment processing by Stripe
      </p>
    </div>
  )
}