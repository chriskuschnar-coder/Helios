import React, { useState, useEffect } from 'react'
import { Copy, CheckCircle, AlertCircle, Coins, Clock, ExternalLink, ArrowLeft } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface CryptoPaymentFlowProps {
  amount: number
  onBack: () => void
  onSuccess: () => void
}

interface CryptoInvoice {
  invoice_id: string
  payment_address: string
  crypto_amount: number
  cryptocurrency: string
  amount_usd: number
  expires_at: string
  exchange_rate: number
  required_confirmations: number
}

export function CryptoPaymentFlow({ amount, onBack, onSuccess }: CryptoPaymentFlowProps) {
  const { user } = useAuth()
  const [selectedCrypto, setSelectedCrypto] = useState('')
  const [invoice, setInvoice] = useState<CryptoInvoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [timeRemaining, setTimeRemaining] = useState('')

  const cryptoOptions = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      networkFee: '~$15',
      rate: 106250
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'Ξ',
      networkFee: '~$25',
      rate: 3195
    },
    {
      id: 'USDT',
      name: 'Tether',
      symbol: '₮',
      networkFee: '~$5',
      rate: 1
    },
    {
      id: 'SOL',
      name: 'Solana',
      symbol: '◎',
      networkFee: '~$0.01',
      rate: 245
    }
  ]

  // Update countdown timer
  useEffect(() => {
    if (!invoice) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(invoice.expires_at).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [invoice])

  // Poll payment status
  useEffect(() => {
    if (!invoice) return

    const checkPaymentStatus = async () => {
      try {
        const { supabaseClient } = await import('../lib/supabase-client')
        const { data: { session } } = await supabaseClient.auth.getSession()
        
        if (!session) return

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'

        const response = await fetch(`${supabaseUrl}/functions/v1/crypto-payment?invoice_id=${invoice.invoice_id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey
          }
        })

        if (response.ok) {
          const status = await response.json()
          setPaymentStatus(status.status)
          
          if (status.status === 'confirmed') {
            onSuccess()
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkPaymentStatus, 30000)
    return () => clearInterval(interval)
  }, [invoice, onSuccess])

  const createCryptoInvoice = async (cryptocurrency: string) => {
    if (!user) {
      setError('Please sign in to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'

      const response = await fetch(`${supabaseUrl}/functions/v1/crypto-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          amount_usd: amount,
          cryptocurrency: cryptocurrency
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create crypto payment')
      }

      const invoiceData = await response.json()
      setInvoice(invoiceData)
      console.log('✅ Crypto invoice created:', invoiceData)

    } catch (error) {
      console.error('❌ Crypto invoice creation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to create crypto payment')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'partial': return 'text-yellow-600 bg-yellow-50'
      case 'expired': return 'text-red-600 bg-red-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  // If we have an invoice, show payment details
  if (invoice) {
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {invoice.cryptocurrency} Payment
          </h3>
          <p className="text-gray-600">
            Send exactly {invoice.crypto_amount} {invoice.cryptocurrency} to complete your ${amount.toLocaleString()} investment
          </p>
        </div>

        {/* Payment Status */}
        <div className={`rounded-lg p-4 mb-6 border ${getStatusColor(paymentStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Payment Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span>
            </div>
            <div className="text-sm font-medium">
              {timeRemaining && `Expires in: ${timeRemaining}`}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-navy-50 border border-navy-200 rounded-lg p-6 mb-6">
          <h4 className="font-medium text-navy-900 mb-4">Payment Details</h4>
          
          {/* Amount to Send */}
          <div className="bg-white border border-navy-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-navy-900 mb-2">Exact Amount to Send</div>
            <div className="text-3xl font-bold text-navy-900 mb-2">
              {invoice.crypto_amount} {invoice.cryptocurrency}
            </div>
            <div className="text-sm text-gray-600">
              USD Value: ${invoice.amount_usd.toLocaleString()} (Rate: ${invoice.exchange_rate.toLocaleString()})
            </div>
          </div>
          
          {/* Payment Address */}
          <div className="bg-white border rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-navy-900 mb-2">Payment Address</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm break-all mr-2">
                {invoice.payment_address}
              </span>
              <button
                onClick={() => copyToClipboard(invoice.payment_address, 'address')}
                className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
              >
                {copiedField === 'address' ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <Copy className="h-4 w-4 text-gray-600" />
                }
              </button>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-gray-500 text-sm">QR Code</span>
            </div>
            <div className="text-xs text-gray-600">Scan with your crypto wallet</div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Important Instructions</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Send exactly <strong>{invoice.crypto_amount} {invoice.cryptocurrency}</strong></li>
            <li>• Only send {invoice.cryptocurrency} to this address</li>
            <li>• Confirmations required: {invoice.required_confirmations} blocks</li>
            <li>• Payment expires in {timeRemaining}</li>
            <li>• Contact support if payment doesn't appear within 2 hours</li>
          </ul>
        </div>

        {/* Transaction Hash Input (for testing) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">
            For Testing: Simulate Payment Confirmation
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter transaction hash (for testing)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                // Simulate payment confirmation
                setPaymentStatus('confirmed')
                setTimeout(onSuccess, 1000)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Simulate Payment
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            In production, payments are detected automatically via blockchain monitoring
          </p>
        </div>
      </div>
    )
  }

  // Show cryptocurrency selection
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
          Select your preferred cryptocurrency for ${amount.toLocaleString()} investment
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

      {/* Cryptocurrency Selection */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Select Cryptocurrency</h4>
        <div className="grid grid-cols-2 gap-4">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto.id)}
              disabled={loading}
              className={`border-2 rounded-lg p-6 text-center transition-colors cursor-pointer disabled:opacity-50 ${
                selectedCrypto === crypto.id 
                  ? 'border-navy-600 bg-navy-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl font-bold text-navy-600 mb-3">{crypto.symbol}</div>
              <div className="font-medium text-gray-900">{crypto.name} ({crypto.id})</div>
              <div className="text-sm text-gray-600 mt-2">Network fee: {crypto.networkFee}</div>
              <div className="text-sm text-navy-600 font-medium mt-2">
                ≈ {crypto.id === 'USDT' ? 
                  amount.toLocaleString() : 
                  (amount / crypto.rate).toFixed(crypto.id === 'BTC' ? 6 : 4)
                } {crypto.id}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Payment Button */}
      <button
        onClick={() => createCryptoInvoice(selectedCrypto)}
        disabled={!selectedCrypto || loading}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating Payment Address...
          </>
        ) : (
          <>
            <Coins className="h-5 w-5 mr-2" />
            Generate {selectedCrypto} Payment Address
          </>
        )}
      </button>

      {!selectedCrypto && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Please select a cryptocurrency to continue
        </p>
      )}
    </div>
  )
}