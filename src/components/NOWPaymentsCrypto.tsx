import React, { useState, useEffect } from 'react'
import { Coins, Copy, CheckCircle, AlertCircle, ExternalLink, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { nowPaymentsClient } from '../lib/nowpayments-client'

interface NOWPaymentsCryptoProps {
  amount: number
  userId?: string
  onSuccess: (payment: any) => void
  onError: (error: string) => void
  onBack: () => void
}

export function NOWPaymentsCrypto({ amount, userId, onSuccess, onError, onBack }: NOWPaymentsCryptoProps) {
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const [copiedField, setCopiedField] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState('btc')
  const [estimatedAmount, setEstimatedAmount] = useState<number | null>(null)
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Popular cryptocurrencies with their display info
  const cryptoOptions = [
    { code: 'btc', name: 'Bitcoin', symbol: '₿', color: 'text-orange-600' },
    { code: 'eth', name: 'Ethereum', symbol: 'Ξ', color: 'text-blue-600' },
    { code: 'usdt', name: 'Tether USDT', symbol: '₮', color: 'text-green-600' },
    { code: 'usdc', name: 'USD Coin', symbol: '$', color: 'text-blue-500' },
    { code: 'ltc', name: 'Litecoin', symbol: 'Ł', color: 'text-gray-600' },
    { code: 'ada', name: 'Cardano', symbol: '₳', color: 'text-blue-700' },
    { code: 'sol', name: 'Solana', symbol: '◎', color: 'text-purple-600' },
    { code: 'matic', name: 'Polygon', symbol: '⬟', color: 'text-purple-500' }
  ]

  // Load available currencies on mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await nowPaymentsClient.getAvailableCurrencies()
        setAvailableCurrencies(currencies)
        console.log('✅ Available currencies loaded:', currencies.length)
      } catch (error) {
        console.error('❌ Failed to load currencies:', error)
        // Use fallback currencies
        setAvailableCurrencies(['btc', 'eth', 'usdt', 'usdc', 'ltc'])
      }
    }

    loadCurrencies()
  }, [])

  // Get estimated amount when crypto selection changes
  useEffect(() => {
    if (selectedCrypto && amount > 0) {
      const getEstimate = async () => {
        try {
          const estimate = await nowPaymentsClient.getEstimatedPrice(amount, 'usd', selectedCrypto)
          setEstimatedAmount(estimate)
          console.log(`💰 Estimated ${selectedCrypto.toUpperCase()} amount:`, estimate)
        } catch (error) {
          console.error('❌ Failed to get price estimate:', error)
          setEstimatedAmount(null)
        }
      }

      getEstimate()
    }
  }, [selectedCrypto, amount])

  const createNOWPayment = async () => {
    if (!userId) {
      onError('User not authenticated')
      return
    }

    setLoading(true)

    try {
      console.log('🔗 Creating NOWPayments payment for amount:', amount, 'in', selectedCrypto.toUpperCase())
      
      const orderId = `GMC-${userId}-${Date.now()}`
      
      const paymentParams = {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: selectedCrypto,
        order_id: orderId,
        order_description: `Global Market Consulting Investment - $${amount.toLocaleString()}`,
        ipn_callback_url: `https://upevugqarcvxnekzddeh.supabase.co/functions/v1/nowpayments-webhook`,
        success_url: `${window.location.origin}/funding-success?payment_id={payment_id}&amount=${amount}`,
        cancel_url: `${window.location.origin}/funding-cancelled`,
        customer_email: user?.email || '',
        is_fixed_rate: true,
        is_fee_paid_by_user: true
      }

      const newPayment = await nowPaymentsClient.createPayment(paymentParams)
      console.log('✅ NOWPayments payment created:', newPayment.payment_id)
      
      setPayment(newPayment)
      onSuccess(newPayment)
    } catch (error) {
      console.error('❌ NOWPayments creation failed:', error)
      onError(error instanceof Error ? error.message : 'Failed to create crypto payment')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!payment?.payment_id) return

    setCheckingStatus(true)
    try {
      const status = await nowPaymentsClient.getPaymentStatus(payment.payment_id)
      console.log('🔍 Payment status:', status.payment_status)
      
      if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
        console.log('✅ Payment confirmed!')
        onSuccess(status)
      } else {
        setPayment(prev => ({ ...prev, payment_status: status.payment_status }))
      }
    } catch (error) {
      console.error('❌ Failed to check payment status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
        return 'text-green-600'
      case 'failed':
      case 'expired':
        return 'text-red-600'
      case 'partially_paid':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Waiting for payment'
      case 'confirming':
        return 'Confirming on blockchain'
      case 'confirmed':
        return 'Payment confirmed'
      case 'finished':
        return 'Payment completed'
      case 'failed':
        return 'Payment failed'
      case 'expired':
        return 'Payment expired'
      case 'partially_paid':
        return 'Partially paid'
      default:
        return 'Processing payment'
    }
  }

  // Filter available crypto options
  const availableCryptoOptions = cryptoOptions.filter(crypto => 
    availableCurrencies.includes(crypto.code)
  )

  return (
    <div>
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
          Secure crypto payment processing via NOWPayments for ${amount.toLocaleString()}
        </p>
      </div>

      {!payment ? (
        <div>
          {/* Cryptocurrency Selection */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Select Cryptocurrency</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableCryptoOptions.map((crypto) => (
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

          {/* Estimated Amount */}
          {estimatedAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">You will pay approximately</div>
                <div className="text-2xl font-bold text-blue-900">
                  {estimatedAmount.toFixed(8)} {selectedCrypto.toUpperCase()}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  ≈ ${amount.toLocaleString()} USD
                </div>
              </div>
            </div>
          )}

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
            onClick={createNOWPayment}
            disabled={loading || !selectedCrypto}
            className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Crypto Payment...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Create {selectedCrypto.toUpperCase()} Payment
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Payment Created Successfully</span>
            </div>
            <p className="text-sm text-green-700">
              Your NOWPayments invoice has been created. Send the exact amount to the address below.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment ID</span>
                <button
                  onClick={() => copyToClipboard(payment.payment_id, 'payment_id')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copiedField === 'payment_id' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="font-mono text-sm text-gray-900">{payment.payment_id}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Address</span>
                <button
                  onClick={() => copyToClipboard(payment.pay_address, 'address')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copiedField === 'address' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="font-mono text-sm text-gray-900 break-all">{payment.pay_address}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount to Send</span>
                <button
                  onClick={() => copyToClipboard(payment.pay_amount.toString(), 'amount')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copiedField === 'amount' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {payment.pay_amount} {payment.pay_currency.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">
                ≈ ${payment.price_amount.toLocaleString()} USD
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Status</span>
                <button
                  onClick={checkPaymentStatus}
                  disabled={checkingStatus}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  {checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  payment.payment_status === 'finished' || payment.payment_status === 'confirmed' 
                    ? 'bg-green-500' 
                    : payment.payment_status === 'failed' || payment.payment_status === 'expired'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className={`font-medium ${getStatusColor(payment.payment_status)}`}>
                  {getStatusMessage(payment.payment_status)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Payment Instructions</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Send <strong>exactly</strong> {payment.pay_amount} {payment.pay_currency.toUpperCase()} to the address above</li>
                <li>• Payment will be confirmed automatically on the blockchain</li>
                <li>• Your account balance will update within 10-30 minutes</li>
                <li>• Do not send from an exchange - use a personal wallet</li>
                <li>• Rate is fixed for 10 minutes from creation</li>
              </ul>
            </div>

            <button
              onClick={checkPaymentStatus}
              disabled={checkingStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking Payment Status...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Check Payment Status
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Payment will be automatically confirmed when received on the blockchain
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}