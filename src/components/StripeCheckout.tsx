import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { CreditCard, Loader2, CheckCircle, AlertCircle, DollarSign, Shield, TrendingUp } from 'lucide-react'
import { StripeElementsProvider } from './StripeElementsProvider'
import { EmbeddedStripeForm } from './EmbeddedStripeForm'

interface StripeCheckoutProps {
  productId?: string
  className?: string
  customAmount?: number
}

export function StripeCheckout({ productId, className = '', customAmount }: StripeCheckoutProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(customAmount || 10000) // Default $10,000
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setAmount(Math.max(100, value)) // Minimum $100
  }

  const handleProceedToPayment = () => {
    if (!user) {
      setError('Please sign in to continue')
      return
    }

    if (amount < 100) {
      setError('Minimum investment amount is $100')
      return
    }

    setError('')
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Payment successful:', result)
    setSuccess(true)
    setShowPaymentForm(false)
    // Refresh the page to update account balance
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error)
    setError(error)
    setShowPaymentForm(false)
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
          <p className="text-sm text-gray-600">
            Your account will be updated shortly...
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
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Investment Amount</h3>
              <p className="text-blue-700">${amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <StripeElementsProvider>
          <EmbeddedStripeForm 
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </StripeElementsProvider>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Amount</h3>
        <p className="text-gray-600">Make an investment in our hedge fund with flexible amounts starting from $100</p>
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
            className={`px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-navy-500 hover:bg-navy-50 transition-colors ${
              amount === quickAmount ? 'border-navy-500 bg-navy-50' : ''
            }`}
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
          Payments are processed securely through Stripe. The payment form will appear on this page.
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
        disabled={!user || amount < 100}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors text-lg"
      >
        <CreditCard className="h-5 w-5 mr-2 inline" />
        Invest ${amount.toLocaleString()} Securely
      </button>

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please sign in to continue with your investment
        </p>
      )}
    </div>
  )
}