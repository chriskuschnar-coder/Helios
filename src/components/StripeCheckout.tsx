import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { CreditCard, Loader2, CheckCircle, AlertCircle, DollarSign, Shield, TrendingUp } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe('pk_live_YOUR_NEW_PUBLISHABLE_KEY_HERE')

interface StripeCheckoutProps {
  productId?: string
  className?: string
  customAmount?: number
}

// Payment form component that uses Stripe Elements
function CheckoutForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Stripe not loaded')
      return
    }

    setLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/funding-success`,
        },
        redirect: 'if_required'
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else {
        onSuccess({ success: true })
      }
    } catch (err) {
      onError('Payment processing failed')
    } finally {
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
        </div>
        <p className="text-sm text-green-700">
          <strong>LIVE MODE:</strong> Your payment information is encrypted and processed securely by Stripe. Real charges will be made.
        </p>
      </div>

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: ''
              }
            }
          }}
        />
      </div>

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

export function StripeCheckout({ productId, className = '', customAmount }: StripeCheckoutProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(customAmount || 10000)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setAmount(Math.max(100, value))
  }

  const createPaymentIntent = async () => {
    if (!user) {
      setError('Please sign in to continue');
      return
    }

    if (amount < 100) {
      setError('Minimum investment amount is $100');
      return
    }

    setCreatingPayment(true)
    setError('');

    try {
      console.log('💳 Creating payment intent for amount:', amount);
      
      const { supabaseClient } = await import('../lib/supabase-client');
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      console.log('📡 Calling create-payment-intent function...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4';
      
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
          user_id: user.id,
          metadata: {
            user_id: user.id,
            user_email: user.email,
            investment_amount: amount,
            purpose: 'hedge_fund_investment'
          }
        })
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        
        // Try to parse as JSON, fallback to text
        let errorMessage = 'Failed to initialize payment';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // If it's HTML (like an error page), show a generic message
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
            errorMessage = 'Payment service temporarily unavailable. Please try again.';
          } else {
            errorMessage = errorText.substring(0, 100);
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Payment intent response:', responseData);

      if (!responseData.client_secret) {
        throw new Error('No client secret received from payment service');
      }

      setClientSecret(responseData.client_secret);
      setShowPaymentForm(true);
      console.log('✅ Payment intent created successfully');
      
    } catch (error) {
      console.error('❌ Payment intent creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setCreatingPayment(false);
    }
  };

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
    // Don't close the payment form - let user try again
    // setShowPaymentForm(false)
    // setClientSecret(null)
  }

  const handleBackToAmount = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    setError('')
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

  if (showPaymentForm && clientSecret) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#1e40af',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#dc2626',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
    }

    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <button
          onClick={handleBackToAmount}
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

        <Elements stripe={stripePromise} options={options}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            </div>
          )}
          <CheckoutForm 
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">Live Payment Processing</span>
        </div>
        <p className="text-sm text-green-700">
          <strong>LIVE MODE:</strong> Your payment information is encrypted and processed securely by Stripe. Real charges will be made.
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
        onClick={createPaymentIntent}
        disabled={!user || amount < 100 || creatingPayment}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
      >
        {creatingPayment ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Initializing Secure Payment...
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