import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Ban as Bank, Wallet, Building, Lock, CheckCircle, AlertCircle, X, Copy, ExternalLink } from 'lucide-react'

// Initialize Stripe with proper error handling
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S1jDNFxYb2Rp5SOdBaVqGD29UBmOLc9Q3Amj5GBVXY74H1TS1Ygpi6lamYt1cFe2Ud4dBn4IPcVS8GkjybKVWJQ00h661Fiq6')

// Debug Stripe loading
console.log('🔍 Stripe Environment Check:')
console.log('Publishable Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Loaded ✅' : 'Missing ❌')
console.log('Stripe Promise:', stripePromise)

interface PaymentProcessorProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onClose: () => void
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  fees: string
  timeframe: string
  minAmount: number
  maxAmount: number
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Instant funding with any major card',
    icon: CreditCard,
    fees: '2.9% + $0.30',
    timeframe: 'Instant',
    minAmount: 100,
    maxAmount: 50000
  },
  {
    id: 'ach',
    name: 'Bank Transfer (ACH)',
    description: 'Direct bank account transfer',
    icon: Bank,
    fees: '$5 flat fee',
    timeframe: '1-3 business days',
    minAmount: 100,
    maxAmount: 500000
  },
  {
    id: 'wire',
    name: 'Wire Transfer',
    description: 'Large amount transfers',
    icon: Building,
    fees: '$25 + bank fees',
    timeframe: 'Same day',
    minAmount: 10000,
    maxAmount: 10000000
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    description: 'Bitcoin, Ethereum, USDC, USDT',
    icon: Wallet,
    fees: 'Network fees only',
    timeframe: '10-60 minutes',
    minAmount: 100,
    maxAmount: 1000000
  }
]

function CardPaymentForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [stripeReady, setStripeReady] = useState(false)
  const [cardError, setCardError] = useState('')

  useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true)
      console.log('✅ Stripe and Elements loaded successfully')
    } else {
      console.log('⏳ Waiting for Stripe to load...')
    }
  }, [stripe, elements])

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message)
    } else {
      setCardError('')
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Payment system not ready. Please wait a moment and try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card information is required')
      return
    }
    setLoading(true)
    setCardError('')

    try {
      // Create payment intent via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to cents
          user_id: 'demo-user' // In production, get from auth context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      console.log('✅ Payment intent created:', client_secret)

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (confirmError) {
        onError(confirmError.message || 'Payment failed')
        console.log('❌ Payment failed:', confirmError)
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent)
        onSuccess({
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          method: 'card',
          status: 'completed'
        })
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      onError('Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  if (!stripeReady) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading payment system...</p>
        <p className="text-xs text-gray-500 mt-2">Connecting to Stripe...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Card Payment</span>
          <Lock className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
        </div>
        <div className="bg-white rounded border border-gray-300 p-3">
          <CardElement
            onChange={handleCardChange}
            options={{
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
              },
            }}
          />
        </div>
        {cardError && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {cardError}
          </div>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Card Information</span>
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        <div className="bg-white rounded border border-gray-300 p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Amount:</span>
          <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">Processing fee (2.9% + $0.30):</span>
          <span className="text-gray-600 text-sm">${((amount * 0.029) + 0.30).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total charge:</span>
            <span className="font-bold text-gray-900">${(amount + (amount * 0.029) + 0.30).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          `Secure Payment - $${amount.toLocaleString()}`
        )}
      </button>
    </form>
      <p className="text-xs text-gray-500 text-center">
        Your payment information is encrypted and secure. Powered by bank-level security.
      </p>
  )
}

function ACHPaymentForm({ amount, onSuccess }: { amount: number, onSuccess: (result: any) => void }) {
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    accountHolderName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate ACH processing
    setTimeout(() => {
      onSuccess({
        id: 'ach_' + Math.random().toString(36).substr(2, 9),
        amount,
        method: 'ach',
        status: 'pending',
        estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Bank className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">ACH Bank Transfer</span>
        </div>
        <p className="text-sm text-blue-700">
          Funds will be debited from your bank account in 1-3 business days. 
          Lower fees than card payments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name
          </label>
          <input
            type="text"
            value={bankDetails.accountHolderName}
            onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full name on account"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <select
            value={bankDetails.accountType}
            onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Routing Number
        </label>
        <input
          type="text"
          value={bankDetails.routingNumber}
          onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="9-digit routing number"
          pattern="[0-9]{9}"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Number
        </label>
        <input
          type="text"
          value={bankDetails.accountNumber}
          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Account number"
          required
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Transfer amount:</span>
          <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">ACH fee:</span>
          <span className="text-gray-600 text-sm">$5.00</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total debit:</span>
            <span className="font-bold text-gray-900">${(amount + 5).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
      >
        Initiate ACH Transfer - ${amount.toLocaleString()}
      </button>
    </form>
  )
}

function WireTransferForm({ amount, onSuccess }: { amount: number, onSuccess: (result: any) => void }) {
  const [copied, setCopied] = useState('')

  const wireInstructions = {
    bankName: 'JPMorgan Chase Bank, N.A.',
    routingNumber: '021000021',
    accountNumber: '4567890123',
    accountName: 'Global Market Consulting LLC',
    swiftCode: 'CHASUS33',
    referenceCode: `GMC-${Date.now().toString().slice(-6)}`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleConfirm = () => {
    onSuccess({
      id: 'wire_' + wireInstructions.referenceCode,
      amount,
      method: 'wire',
      status: 'pending',
      reference_code: wireInstructions.referenceCode,
      estimated_completion: 'Same business day'
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-900">Wire Transfer Instructions</span>
        </div>
        <p className="text-sm text-yellow-700">
          Use these details to send a wire transfer from your bank. 
          Include the reference code to ensure proper crediting.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">Banking Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bank Name:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{wireInstructions.bankName}</span>
              <button
                onClick={() => copyToClipboard(wireInstructions.bankName, 'bank')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Routing Number:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium text-gray-900">{wireInstructions.routingNumber}</span>
              <button
                onClick={() => copyToClipboard(wireInstructions.routingNumber, 'routing')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              {copied === 'routing' && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Account Number:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium text-gray-900">{wireInstructions.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(wireInstructions.accountNumber, 'account')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              {copied === 'account' && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium text-gray-900">{wireInstructions.accountName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">SWIFT Code:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium text-gray-900">{wireInstructions.swiftCode}</span>
              <button
                onClick={() => copyToClipboard(wireInstructions.swiftCode, 'swift')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
              {copied === 'swift' && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-red-700 font-medium">Reference Code:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-red-900">{wireInstructions.referenceCode}</span>
                <button
                  onClick={() => copyToClipboard(wireInstructions.referenceCode, 'reference')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copied === 'reference' && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            </div>
            <p className="text-xs text-red-600 mt-1">
              CRITICAL: Include this reference code in your wire transfer memo
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Wire amount:</span>
          <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">Wire fee:</span>
          <span className="text-gray-600 text-sm">$25.00</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Bank fees:</span>
          <span className="text-gray-600 text-sm">Varies by bank</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
      >
        I've Sent the Wire Transfer
      </button>
    </div>
  )
}

function CryptoPaymentForm({ amount, onSuccess }: { amount: number, onSuccess: (result: any) => void }) {
  const [selectedCrypto, setSelectedCrypto] = useState('USDC')
  const [showAddress, setShowAddress] = useState(false)

  const cryptoOptions = [
    { symbol: 'USDC', name: 'USD Coin', rate: 1.00, network: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether', rate: 1.00, network: 'Ethereum' },
    { symbol: 'BTC', name: 'Bitcoin', rate: 0.000023, network: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', rate: 0.00046, network: 'Ethereum' }
  ]

  const selectedOption = cryptoOptions.find(opt => opt.symbol === selectedCrypto)!
  const cryptoAmount = amount * selectedOption.rate

  const addresses = {
    USDC: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
    USDT: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e'
  }

  const handleGenerateAddress = () => {
    setShowAddress(true)
  }

  const handleConfirmSent = () => {
    onSuccess({
      id: 'crypto_' + Math.random().toString(36).substr(2, 9),
      amount,
      method: 'crypto',
      currency: selectedCrypto,
      status: 'pending',
      address: addresses[selectedCrypto as keyof typeof addresses],
      estimated_completion: '10-60 minutes'
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <Wallet className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-purple-900">Cryptocurrency Payment</span>
        </div>
        <p className="text-sm text-purple-700">
          Send cryptocurrency to our secure wallet. Funds are credited after network confirmation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Cryptocurrency
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.symbol}
              type="button"
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedCrypto === crypto.symbol
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{crypto.symbol}</div>
              <div className="text-sm text-gray-600">{crypto.name}</div>
              <div className="text-xs text-gray-500">{crypto.network}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">USD Amount:</span>
          <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">{selectedCrypto} Amount:</span>
          <span className="font-mono font-bold text-gray-900">
            {cryptoAmount.toFixed(selectedCrypto === 'BTC' ? 8 : selectedCrypto === 'ETH' ? 6 : 2)} {selectedCrypto}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Network fees:</span>
          <span className="text-gray-600 text-sm">Paid by sender</span>
        </div>
      </div>

      {!showAddress ? (
        <button
          onClick={handleGenerateAddress}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Generate {selectedCrypto} Address
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Send {selectedCrypto} to:</span>
              <button
                onClick={() => copyToClipboard(addresses[selectedCrypto as keyof typeof addresses], 'address')}
                className="text-gray-400 hover:text-gray-200"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="font-mono text-white text-sm break-all bg-gray-800 p-3 rounded">
              {addresses[selectedCrypto as keyof typeof addresses]}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-gray-400 text-xs">Network: {selectedOption.network}</span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-400 text-xs">Amount: {cryptoAmount.toFixed(selectedCrypto === 'BTC' ? 8 : 6)} {selectedCrypto}</span>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Important</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Send exactly {cryptoAmount.toFixed(selectedCrypto === 'BTC' ? 8 : 6)} {selectedCrypto}</li>
              <li>• Use {selectedOption.network} network only</li>
              <li>• Double-check the address before sending</li>
              <li>• Funds are credited after 3 network confirmations</li>
            </ul>
          </div>

          <button
            onClick={handleConfirmSent}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            I've Sent the Cryptocurrency
          </button>
        </div>
      )}
    </div>
  )
}

export function PaymentProcessor({ amount, onSuccess, onError, onClose }: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId)
    if (method && amount >= method.minAmount && amount <= method.maxAmount) {
      setSelectedMethod(methodId)
    }
  }

  const handlePaymentSuccess = async (result: any) => {
    setProcessing(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onSuccess(result)
    setProcessing(false)
  }

  if (processing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processed</h3>
          <p className="text-gray-600 mb-4">
            Your funding request has been submitted successfully. 
            Your account will be updated once the payment is confirmed.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Updating your account balance...
          </div>
        </div>
      </div>
    )
  }

  if (!selectedMethod) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Capital - ${amount.toLocaleString()}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Choose your preferred payment method to fund your trading account.
            </p>
            
            <div className="grid gap-4">
              {paymentMethods.map((method) => {
                const isAvailable = amount >= method.minAmount && amount <= method.maxAmount
                
                return (
                  <button
                    key={method.id}
                    onClick={() => isAvailable && handleMethodSelect(method.id)}
                    disabled={!isAvailable}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      isAvailable
                        ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isAvailable ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <method.icon className={`h-6 w-6 ${
                          isAvailable ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Fee: {method.fees}</span>
                          <span className="text-xs text-gray-500">Time: {method.timeframe}</span>
                        </div>
                        {!isAvailable && (
                          <div className="text-xs text-red-600 mt-1">
                            Amount must be between ${method.minAmount.toLocaleString()} - ${method.maxAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      {isAvailable && (
                        <div className="text-blue-600">
                          <ExternalLink className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show selected payment method form
  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod)!

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <selectedMethodData.icon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{selectedMethodData.name}</h3>
          </div>
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {selectedMethod === 'card' && (
            <Elements stripe={stripePromise}>
              <CardPaymentForm 
                amount={amount} 
                onSuccess={handlePaymentSuccess} 
                onError={onError} 
              />
            </Elements>
          )}
          
          {selectedMethod === 'ach' && (
            <ACHPaymentForm 
              amount={amount} 
              onSuccess={handlePaymentSuccess} 
            />
          )}
          
          {selectedMethod === 'wire' && (
            <WireTransferForm 
              amount={amount} 
              onSuccess={handlePaymentSuccess} 
            />
          )}
          
          {selectedMethod === 'crypto' && (
            <CryptoPaymentForm 
              amount={amount} 
              onSuccess={handlePaymentSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  )
}