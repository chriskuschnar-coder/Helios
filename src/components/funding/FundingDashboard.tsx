import React, { useState } from 'react'
import { CreditCard, Building, Zap, Coins, Shield, Clock, CheckCircle, AlertCircle, TrendingUp, DollarSign, Plus, ArrowRight, Copy, ExternalLink } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { StripeCheckout } from '../StripeCheckout'
import { NOWPaymentsCrypto } from '../NOWPaymentsCrypto'

interface FundingMethod {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  processingTime: string
  fees: string
  minAmount: number
  maxAmount: number
  available: boolean
  popular?: boolean
}

interface FundingTransaction {
  id: string
  method: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  date: string
  reference?: string
}

export function FundingDashboard() {
  const { account, user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [fundingAmount, setFundingAmount] = useState(10000)
  const [showStripeForm, setShowStripeForm] = useState(false)
  const [showWireInstructions, setShowWireInstructions] = useState(false)
  const [showCryptoPayment, setShowCryptoPayment] = useState(false)
  const [showBankTransfer, setShowBankTransfer] = useState(false)
  const [wireReference, setWireReference] = useState('')

  const fundingMethods: FundingMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Instant processing',
      processingTime: 'Instant',
      fees: 'No fees',
      minAmount: 100,
      maxAmount: 50000,
      available: true,
      popular: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: '1-3 business days',
      processingTime: '1-3 business days',
      fees: 'No fees',
      minAmount: 100,
      maxAmount: 250000,
      available: true
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      icon: Zap,
      description: 'Same day processing',
      processingTime: 'Same day',
      fees: '$25 fee',
      minAmount: 10000,
      maxAmount: 1000000,
      available: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Coins,
      description: 'Bitcoin, Ethereum',
      processingTime: '10-30 minutes',
      fees: 'Network fees apply',
      minAmount: 100,
      maxAmount: 100000,
      available: true
    }
  ]

  // Mock recent funding transactions
  const recentTransactions: FundingTransaction[] = [
    {
      id: '1',
      method: 'Credit Card',
      amount: 25000,
      status: 'completed',
      date: '2025-01-29',
      reference: 'pi_3QkL...'
    },
    {
      id: '2',
      method: 'Wire Transfer',
      amount: 50000,
      status: 'completed',
      date: '2025-01-25',
      reference: 'WIRE-GMC-001'
    }
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    
    if (methodId === 'card') {
      setShowStripeForm(true)
      setShowWireInstructions(false)
      setShowCryptoPayment(false)
      setShowBankTransfer(false)
    } else if (methodId === 'wire') {
      setShowWireInstructions(true)
      setShowStripeForm(false)
      setShowCryptoPayment(false)
      setShowBankTransfer(false)
      generateWireReference()
    } else if (methodId === 'bank') {
      setShowBankTransfer(true)
      setShowStripeForm(false)
      setShowWireInstructions(false)
      setShowCryptoPayment(false)
    } else if (methodId === 'crypto') {
      setShowCryptoPayment(true)
      setShowStripeForm(false)
      setShowWireInstructions(false)
      setShowBankTransfer(false)
    } else {
      setShowStripeForm(false)
      setShowWireInstructions(false)
      setShowCryptoPayment(false)
      setShowBankTransfer(false)
    }
  }

  const generateWireReference = () => {
    const ref = 'GMC-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    setWireReference(ref)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fundingMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => method.available && handleMethodSelect(method.id)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-navy-500 bg-navy-50'
                  : method.available
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              {method.popular && (
                <div className="absolute -top-3 -right-3 bg-gold-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <method.icon className="h-8 w-8 text-gray-600" />
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-2">{method.name}</h4>
                <p className="text-gray-600 mb-4">{method.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="text-green-600 font-semibold">{method.fees}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SIPC Protection Notice */}
        <div className="flex items-center justify-center text-gray-600">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span>SIPC Protected up to $500,000</span>
        </div>
      </div>

      {/* Funding Information Sidebar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Funding Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Secure payment processing via Stripe</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Instant account funding</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Professional capital management</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Real-time portfolio tracking</span>
          </div>
        </div>
      </div>

      {/* Stripe Payment Form */}
      {showStripeForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy-900">Credit Card Payment</h3>
            <button
              onClick={() => setShowStripeForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <StripeCheckout customAmount={fundingAmount} />
        </div>
      )}

      {/* Wire Transfer Instructions */}
      {showWireInstructions && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy-900">Wire Transfer Instructions</h3>
            <button
              onClick={() => setShowWireInstructions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Important Instructions</span>
            </div>
            <p className="text-sm text-blue-700">
              Please include your reference code in the wire transfer memo. Processing typically takes 1-2 business days.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 mt-1">
                  <span className="font-medium">JPMorgan Chase Bank, N.A.</span>
                  <button
                    onClick={() => copyToClipboard('JPMorgan Chase Bank, N.A.')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Routing Number</label>
                <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 mt-1">
                  <span className="font-mono">021000021</span>
                  <button
                    onClick={() => copyToClipboard('021000021')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Account Number</label>
                <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 mt-1">
                  <span className="font-mono">4567890123</span>
                  <button
                    onClick={() => copyToClipboard('4567890123')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Account Name</label>
                <div className="bg-gray-50 border rounded-lg p-3 mt-1">
                  <span className="font-medium">Global Market Consulting LLC</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Reference Code</label>
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1">
                  <span className="font-mono font-bold text-yellow-900">{wireReference}</span>
                  <button
                    onClick={() => copyToClipboard(wireReference)}
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <Copy className="h-4 w-4 text-yellow-600" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="bg-gray-50 border rounded-lg p-3 mt-1">
                  <span className="font-bold text-lg">${fundingAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer with Plaid */}
      {showBankTransfer && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy-900">Bank Transfer (ACH)</h3>
            <button
              onClick={() => setShowBankTransfer(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Bank Connection</h3>
            <p className="text-gray-600">
              Connect your bank account for ${fundingAmount.toLocaleString()} investment
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Powered by Plaid</span>
            </div>
            <p className="text-sm text-green-700 mb-4">
              We use Plaid to securely connect to your bank account. Your login credentials are encrypted and never stored.
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Bank-level security (256-bit encryption)</li>
              <li>• No fees for ACH transfers</li>
              <li>• Processing time: 1-3 business days</li>
              <li>• Supports 11,000+ financial institutions</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                // In production, this would open Plaid Link
                alert('Plaid integration will be implemented here. This would open a secure bank connection flow.');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Building className="h-5 w-5 mr-2" />
              Connect Bank Account Securely
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Powered by Plaid • Used by millions of Americans
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cryptocurrency Payment with NOWPayments */}
      {showCryptoPayment && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy-900">Cryptocurrency Payment</h3>
            <button
              onClick={() => setShowCryptoPayment(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          {user?.id ? (
            <NOWPaymentsCrypto 
              amount={fundingAmount}
              userId={user.id}
              onSuccess={(payment) => {
                console.log('✅ NOWPayments payment initiated:', payment)
                // Payment will be confirmed via webhook
                setShowCryptoPayment(false)
              }}
              onError={(error) => {
                console.error('❌ NOWPayments payment error:', error)
                alert(`Crypto payment error: ${error}`)
              }}
              onBack={() => setShowCryptoPayment(false)}
            />
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">Please sign in to continue with crypto payment</p>
              <button
                onClick={() => setShowCryptoPayment(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Close and Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Funding Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-navy-900">Recent Funding Activity</h3>
          <button className="text-navy-600 hover:text-navy-700 text-sm font-medium flex items-center space-x-1">
            <span>View All</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                  </div>
    </div>
  )
}