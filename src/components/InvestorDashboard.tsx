import React, { useState } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Activity,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { supabaseClient } from '../lib/supabase-client'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6')

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
    complete: {
      color: '#059669',
    },
  },
  hidePostalCode: true,
}

function StripeCardForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card information required')
      return
    }

    setLoading(true)

    try {
      // Create payment intent
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          user_id: user?.id || 'demo-user'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      console.log('✅ Payment intent created')

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.full_name || 'Account Holder',
            email: user?.email
          },
        }
      })

      if (confirmError) {
        console.log('❌ Payment failed:', confirmError)
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back from cents
          method: 'card',
          status: 'completed'
        })
      } else {
        onError('Payment was not completed successfully')
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError(error instanceof Error ? error.message : 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(event) => {
              if (event.error) {
                setCardError(event.error.message)
              } else {
                setCardError('')
              }
            }}
          />
        </div>
        {cardError && (
          <p className="text-red-600 text-sm mt-1">{cardError}</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-bold">${amount.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium"
      >
        {loading ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
      </button>
    </form>
  )
}

export function InvestorDashboard() {
  const { user, account, refreshAccount, processFunding } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showFunding, setShowFunding] = useState(false)
  const [fundingAmount, setFundingAmount] = useState(1000)

  const portfolioData = {
    totalValue: account?.balance || 0,
    monthlyReturn: 2.4,
    yearlyReturn: 12.8,
    totalReturn: 45.2,
    dailyPnL: 18500,
    dailyPnLPct: 0.76
  }

  const holdings = [
    { name: 'Alpha Fund', allocation: 65, value: (account?.balance || 0) * 0.65, return: 14.2, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 25, value: (account?.balance || 0) * 0.25, return: 8.7, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 10, value: (account?.balance || 0) * 0.10, return: 18.9, risk: 'High' }
  ]

  const recentTransactions = [
    { date: '2025-01-15', type: 'Dividend', amount: 12500, fund: 'Alpha Fund', status: 'Completed' },
    { date: '2025-01-10', type: 'Investment', amount: 100000, fund: 'Market Neutral Fund', status: 'Completed' },
    { date: '2025-01-05', type: 'Rebalancing', amount: -25000, fund: 'Momentum Portfolio', status: 'Completed' },
    { date: '2025-01-01', type: 'Performance Fee', amount: -8500, fund: 'Alpha Fund', status: 'Completed' }
  ]

  const documents = [
    { name: 'Monthly Performance Report - January 2025', date: '2025-01-31', type: 'Performance' },
    { name: 'Quarterly Investment Letter - Q4 2024', date: '2025-01-15', type: 'Letter' },
    { name: 'Annual Tax Statement - 2024', date: '2025-01-10', type: 'Tax' },
    { name: 'Risk Disclosure Statement', date: '2024-12-01', type: 'Legal' },
    { name: 'Investment Agreement Amendment', date: '2024-11-15', type: 'Legal' },
    { name: 'Compliance Documentation', date: '2024-10-01', type: 'Compliance' }
  ]

  const tabs = [
    { id: 'overview', name: 'Portfolio Overview', icon: BarChart3 },
    { id: 'holdings', name: 'Holdings Detail', icon: PieChart },
    { id: 'transactions', name: 'Transaction History', icon: Activity },
    { id: 'documents', name: 'Documents', icon: FileText }
  ]

  const handleFundingSuccess = async (result: any) => {
    console.log('💰 Funding successful:', result)
    
    try {
      // Process funding through auth provider
      await processFunding(result.amount, result.method, `Card payment - ${result.id}`)
      await refreshAccount()
      
      setShowFunding(false)
      setFundingAmount(1000)
    } catch (error) {
      console.error('Error updating account:', error)
      alert('Error processing funding: ' + error.message)
    }
  }

  const handleFundingError = (error: string) => {
    console.error('Funding error:', error)
    alert('Payment failed: ' + error)
  }

  // Show empty state if no balance
  if (!account || account.balance === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Investment Account
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your account is ready! Add capital to start investing with our quantitative strategies.
          </p>
          <button
            onClick={() => setShowFunding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Capital
          </button>
        </div>

        {/* Funding Modal */}
        {showFunding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Capital</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="100"
                    step="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
              </div>

              {fundingAmount >= 100 && (
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    amount={fundingAmount}
                    onSuccess={handleFundingSuccess}
                    onError={handleFundingError}
                  />
                </Elements>
              )}

              <button
                onClick={() => setShowFunding(false)}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Portfolio Value</span>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-navy-900 mb-1">
            ${portfolioData.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Institutional Account</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Daily P&L</span>
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-green-600 mb-1">
            +${portfolioData.dailyPnL.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">+{portfolioData.dailyPnLPct}%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">YTD Return</span>
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-green-600 mb-1">
            +{portfolioData.yearlyReturn}%
          </div>
          <div className="text-sm text-gray-500">Outperforming benchmark</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Available Cash</span>
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-navy-900 mb-1">
            ${account?.available_balance?.toLocaleString() || '0'}
          </div>
          <button
            onClick={() => setShowFunding(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add Capital
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-navy-600 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">Asset Allocation</h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{holding.name}</div>
                          <div className="text-sm text-gray-600">{holding.allocation}% allocation • {holding.risk} risk</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${holding.value.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">+{holding.return}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-navy-50 rounded-lg p-6">
                    <h4 className="font-medium text-navy-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sharpe Ratio</span>
                        <span className="font-medium text-navy-900">2.84</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Drawdown</span>
                        <span className="font-medium text-navy-900">-4.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volatility</span>
                        <span className="font-medium text-navy-900">8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beta</span>
                        <span className="font-medium text-navy-900">0.65</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'holdings' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-navy-900">Detailed Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-medium text-gray-900">Fund Name</th>
                      <th className="text-right py-3 font-medium text-gray-900">Allocation</th>
                      <th className="text-right py-3 font-medium text-gray-900">Market Value</th>
                      <th className="text-right py-3 font-medium text-gray-900">Return</th>
                      <th className="text-right py-3 font-medium text-gray-900">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 font-medium text-gray-900">{holding.name}</td>
                        <td className="py-4 text-right text-gray-600">{holding.allocation}%</td>
                        <td className="py-4 text-right font-medium text-gray-900">
                          ${holding.value.toLocaleString()}
                        </td>
                        <td className="py-4 text-right font-medium text-green-600">
                          +{holding.return}%
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            holding.risk === 'Low' ? 'bg-green-100 text-green-800' :
                            holding.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {holding.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-navy-900">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{transaction.type}</div>
                      <div className="text-sm text-gray-600">{transaction.fund} • {transaction.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">{transaction.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-navy-900">Investment Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">{doc.type} • {doc.date}</div>
                      </div>
                    </div>
                    <button className="text-navy-600 hover:text-navy-700 font-medium text-sm px-3 py-1 rounded border border-navy-200 hover:bg-navy-50 transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Funding Modal */}
      {showFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Capital to Account</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="100"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
            </div>

            {fundingAmount >= 100 ? (
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  amount={fundingAmount}
                  onSuccess={handleFundingSuccess}
                  onError={handleFundingError}
                />
              </Elements>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-700 text-sm">
                    Please enter an amount of $100 or more
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowFunding(false)}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}