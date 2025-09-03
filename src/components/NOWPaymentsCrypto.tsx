import React, { useState } from 'react'
import { Coins, ArrowLeft, AlertCircle, ExternalLink, Shield, CheckCircle } from 'lucide-react'

interface NOWPaymentsCryptoProps {
  amount: number
  userId?: string
  onSuccess: (payment: any) => void
  onError: (error: string) => void
  onBack: () => void
}

export function NOWPaymentsCrypto({ amount, userId, onSuccess, onError, onBack }: NOWPaymentsCryptoProps) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState('btc')
  const [paymentUrl, setPaymentUrl] = useState('')

  // Popular cryptocurrencies
  const cryptoOptions = [
    { code: 'btc', name: 'Bitcoin', symbol: '₿', color: 'text-orange-600' },
    { code: 'eth', name: 'Ethereum', symbol: 'Ξ', color: 'text-blue-600' },
    { code: 'usdt', name: 'Tether USDT', symbol: '₮', color: 'text-green-600' },
    { code: 'usdc', name: 'USD Coin', symbol: '$', color: 'text-blue-500' }
  ]

  const createPaymentLink = () => {
    if (!userId) {
      onError('User not authenticated')
      return
    }

    try {
      // Create NOWPayments payment link
      const orderId = `GMC-${userId}-${Date.now()}`
      const successUrl = `${window.location.origin}/funding-success?amount=${amount}`
      const cancelUrl = `${window.location.origin}/funding-cancelled`
      
      // NOWPayments payment link format
      const paymentParams = new URLSearchParams({
        amount: amount.toString(),
        currency_from: 'usd',
        currency_to: selectedCrypto,
        order_id: orderId,
        order_description: `Global Market Consulting Investment - $${amount.toLocaleString()}`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: 'investor@globalmarket.com' // You can use user email here
      })

      // Create the payment URL
      const url = `https://nowpayments.io/payment/?${paymentParams.toString()}`
      setPaymentUrl(url)
      setShowEmbed(true)
      
      console.log('✅ NOWPayments link created:', url)
    } catch (error) {
      console.error('❌ Failed to create payment link:', error)
      onError('Failed to create crypto payment')
    }
  }

  if (showEmbed && paymentUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setShowEmbed(false)
              setPaymentUrl('')
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Crypto Selection
          </button>
          
          <button
            onClick={() => window.open(paymentUrl, '_blank')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            Open in New Tab
            <ExternalLink className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Secure Crypto Payment</span>
          </div>
          <p className="text-sm text-green-700">
            Complete your ${amount.toLocaleString()} investment using {selectedCrypto.toUpperCase()} below. 
            Your account will be updated automatically upon blockchain confirmation.
          </p>
        </div>

        {/* NOWPayments Embed */}
        <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <iframe
            src={paymentUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="NOWPayments Crypto Payment"
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Payment Instructions</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Send the exact amount shown to the generated address</li>
            <li>• Payment will be confirmed automatically on the blockchain</li>
            <li>• Your account balance will update within 10-30 minutes</li>
            <li>• Do not send from an exchange - use a personal wallet</li>
            <li>• Keep this page open until payment is complete</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Payment Methods
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="h-8 w-8 text-navy-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cryptocurrency Payment</h3>
        <p className="text-gray-600">
          Secure crypto payment processing for ${amount.toLocaleString()}
        </p>
      </div>

      {/* Cryptocurrency Selection */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Select Cryptocurrency</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.code}
              onClick={() => setSelectedCrypto(crypto.code)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                selectedCrypto === crypto.code
                  ? 'border-navy-500 bg-navy-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-2xl mb-2 ${crypto.color}`}>{crypto.symbol}</div>
              <div className="font-medium text-gray-900 text-sm">{crypto.name}</div>
              <div className="text-xs text-gray-600 uppercase">{crypto.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* NOWPayments Features */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Coins className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">NOWPayments Features</span>
        </div>
        <ul className="text-sm text-green-700 space-y-2">
          <li>• <strong>100+ Cryptocurrencies:</strong> Bitcoin, Ethereum, USDT, and more</li>
          <li>• <strong>Real-time Processing:</strong> Automatic confirmation via blockchain</li>
          <li>• <strong>Fixed Rate:</strong> Price locked for 10 minutes</li>
          <li>• <strong>Low Fees:</strong> Competitive rates with transparent pricing</li>
          <li>• <strong>Instant Updates:</strong> Account balance updated upon confirmation</li>
        </ul>
      </div>

      <button
        onClick={createPaymentLink}
        disabled={!selectedCrypto}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        <Coins className="w-5 h-5 mr-2" />
        Pay with {selectedCrypto.toUpperCase()}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by NOWPayments • Secure blockchain processing
        </p>
      </div>
    </div>
  )
}