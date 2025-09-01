import React, { useState } from 'react'
import { CreditCard, Loader2, ExternalLink, Shield } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { StripeCardForm } from './StripeCardForm'

interface CheckoutButtonProps {
  amount: number
  onSuccess?: () => void
  className?: string
  children?: React.ReactNode
}

export function CheckoutButton({ amount, onSuccess, className, children }: CheckoutButtonProps) {
  const { user, processFunding } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in to invest')
      return
    }

    if (amount < 100) {
      setError('Minimum investment amount is $100')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      console.log('💰 Creating Stripe checkout for amount:', amount)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Get authenticated session
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      console.log('✅ User authenticated, creating checkout session...')

      // Create checkout session via Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          price_id: 'price_1S280LFhEA0kH7xcHCcUrHNN',
          mode: 'payment',
          amount: amount * 100,
          success_url: `${window.location.origin}/funding-success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
          cancel_url: `${window.location.origin}/funding-cancelled`
        })
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Checkout creation failed:', errorData)
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      console.log('✅ Checkout URL received:', url)
      
      if (!url) {
        throw new Error('No checkout URL received')
      }
      
      console.log('🚀 Redirecting to Stripe checkout...')
      window.location.href = url
      
    } catch (error) {
      console.error('❌ Checkout creation error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Investment Processing</span>
        </div>
        <p className="text-sm text-blue-700">
          Your investment will be processed securely. In production, this would redirect to Stripe Checkout.
        </p>
      </div>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Investment...
          </>
        ) : (
          children || (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Add ${amount.toLocaleString()} Capital
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
        Professional payment processing powered by Stripe
      </p>
    </div>
  )
}