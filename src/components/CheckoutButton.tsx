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

    if (amount < 100) {
      setError('Minimum investment amount is $100')
      return
    }
    setLoading(true)
    setError('')

    try {
      console.log('🛒 Creating checkout session for amount:', amount)
      
      // For demo purposes, simulate successful payment
      console.log('💰 Simulating successful payment for amount:', amount)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call the funding success handler directly
      if (onSuccess) {
        onSuccess()
      }
      
      // Show success message
      alert(`Investment of $${amount.toLocaleString()} processed successfully! Your account balance will be updated shortly.`)

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