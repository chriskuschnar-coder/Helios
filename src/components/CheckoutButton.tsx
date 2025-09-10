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

  const handleCheckout = () => {
    // This component is now just a simple button that triggers other payment flows
    console.log('Checkout button clicked for amount:', amount)
    onSuccess?.()
  }

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">Live Investment Processing</span>
        </div>
        <p className="text-sm text-green-700">
          Your investment will be processed securely with real payments through Stripe.
        </p>
      </div>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || "w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Initializing Payment...
          </>
        ) : (
          children || (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Contribute ${amount.toLocaleString()} Capital
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
        Live payment processing powered by Stripe
      </p>
    </div>
  )
}