import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CreditCard, Loader2, ExternalLink, Shield } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6')

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
      console.log('💰 Processing investment for amount:', amount)
      
      // Process funding through auth provider
      await processFunding(amount, 'stripe', `Investment funding - $${amount}`)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Call the funding success handler directly
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error) {
      console.error('❌ Investment processing error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
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
        className={className || "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"}
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
        Demo mode - In production: Secure payment processing by Stripe
      </p>
    </div>
  )
}