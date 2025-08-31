import React, { useState, useEffect } from 'react'
import { X, Shield, CreditCard, Building, Wallet, CheckCircle, ArrowRight, Copy, AlertCircle, Lock, Plus, ExternalLink } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledAmount?: number | null
  onProceedToPayment: (amount: number, method: string) => void
}

interface FundingMethod {
  id: string
  name: string
  icon: React.ComponentType<any>
  time: string
  fee: string
  description: string
  minAmount: number
  maxAmount: number
}

const fundingMethods: FundingMethod[] = [
  {
    id: 'card',
    name: 'Debit/Credit Card',
    icon: CreditCard,
    time: 'Instant',
    fee: '2.9% + $0.30',
    description: 'Secure Stripe Checkout - redirects to Stripe',
    minAmount: 100,
    maxAmount: 50000
  },
  {
    id: 'wire',
    name: 'Wire Transfer',
    icon: Building,
    time: 'Same day',
    fee: '$25 + bank fees',
    description: 'Large amount transfers',
    minAmount: 10000,
    maxAmount: 10000000
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: Wallet,
    time: '10-60 minutes',
    fee: 'Network fees only',
    description: 'Bitcoin, Ethereum, USDC, USDT',
    minAmount: 100,
    maxAmount: 1000000
  }
]

function DynamicStripeCheckout({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (amount < 100) {
      onError('Minimum investment amount is $100')
      return
    }

    setLoading(true)

    try {
      console.log('💳 Creating Stripe checkout session for investment:', amount)
      
      // Create checkout session via Supabase Edge Function with proper error handling
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
      
      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase configuration missing. Please set up environment variables.')
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ 
          amount: amount,
          user_id: user?.id || 'demo-user',
          user_email: user?.email || 'demo@globalmarket.com'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Checkout session creation failed:', response.status, errorText)
        
        let errorMessage = 'Failed to create checkout session'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch (e) {
          // If response isn't JSON, use the text
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const { url } = await response.json()
      console.log('✅ Checkout session created, redirecting to Stripe:', url)
      
      // Redirect to Stripe Checkout - Stripe handles everything
      window.location.href = url
      
    } catch (error) {
      console.error('❌ Checkout creation error:', error)
      
      // Provide specific error messages
      let errorMessage = 'Checkout failed'
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to payment system. Please check your internet connection and try again.'
        } else if (error.message.includes('Supabase')) {
          errorMessage = 'Payment system configuration error. Please contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      onError(errorMessage)
      setLoading(false)
    }
  }

  const processingFee = amount * 0.029 + 0.30
  const totalCharge = amount + processingFee

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Stripe Checkout</span>
          <ExternalLink className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
          You'll be redirected to Stripe's secure checkout page to complete your investment. 
          No card details are stored on our servers.
        </p>
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
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Secure Checkout
            <ExternalLink className="h-4 w-4 ml-2" />
          </>
        )}
      </button>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-700">
          <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242 on Stripe's checkout page
        </p>
      </div>
    </div>
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
  const [copied, setCopied] = useState('')

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
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

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const { account, processFunding } = useAuth()
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (prefilledAmount) {
      setAmount(prefilledAmount.toString())
    }
  }, [prefilledAmount])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
    setAmount(cleanValue)
  }

  const handleMethodSelect = (methodId: string) => {
    const method = fundingMethods.find(m => m.id === methodId)
    const numericAmount = parseFloat(amount) || 0
    if (method && numericAmount >= method.minAmount && numericAmount <= method.maxAmount) {
      setSelectedMethod(methodId)
    }
  }

  const handlePaymentSuccess = async (result: any) => {
    setProcessing(true)
    
    try {
      // Process funding through auth provider
      await processFunding(parseFloat(amount), result.method, `Investment funding - ${result.method}`)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onClose()
      setSelectedMethod(null)
      setAmount('')
    } catch (error) {
      console.error('Funding processing error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + error)
  }

  if (!isOpen) return null

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

  // Method selection screen
  if (!selectedMethod) {
    const numericAmount = parseFloat(amount) || 0

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Investment Capital</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Current Capital</span>
                <span className="text-lg font-bold text-gray-900">${(account?.balance || 0).toLocaleString()}</span>
              </div>
              <div className="text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Available Capital</span>
                <span className="text-lg font-bold text-gray-900">${(account?.available_balance || 0).toLocaleString()}</span>
              </div>
              <div className="text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Investor Status</span>
                <span className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">Qualified</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Amount</h3>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-semibold"
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <button 
                  type="button"
                  onClick={() => setAmount('1000')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  $1,000
                </button>
                <button 
                  type="button"
                  onClick={() => setAmount('5000')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  $5,000
                </button>
                <button 
                  type="button"
                  onClick={() => setAmount('10000')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  $10,000
                </button>
                <button 
                  type="button"
                  onClick={() => setAmount('25000')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  $25,000
                </button>
                <button 
                  type="button"
                  onClick={() => setAmount('50000')}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                >
                  $50,000
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Minimum: $100 • Maximum varies by payment method</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              <div className="grid gap-4">
                {fundingMethods.map((method) => {
                  const isAvailable = numericAmount >= method.minAmount && numericAmount <= method.maxAmount
                  
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
                            <span className="text-xs text-gray-500">Fee: {method.fee}</span>
                            <span className="text-xs text-gray-500">Time: {method.time}</span>
                          </div>
                          {!isAvailable && numericAmount > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              Amount must be between ${method.minAmount.toLocaleString()} - ${method.maxAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {isAvailable && (
                          <div className="text-blue-600">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Qualified Investor Protection</strong><br/>
                  Your investment is processed through institutional-grade security protocols.
                  All capital transfers are encrypted and comply with SEC regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment method form screen
  const selectedMethodData = fundingMethods.find(m => m.id === selectedMethod)!
  const numericAmount = parseFloat(amount)

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
            <DynamicStripeCheckout 
              amount={numericAmount} 
              onSuccess={handlePaymentSuccess} 
              onError={handlePaymentError} 
            />
          )}
          
          {selectedMethod === 'wire' && (
            <WireTransferForm 
              amount={numericAmount} 
              onSuccess={handlePaymentSuccess} 
            />
          )}
          
          {selectedMethod === 'crypto' && (
            <CryptoPaymentForm 
              amount={numericAmount} 
              onSuccess={handlePaymentSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  )
}