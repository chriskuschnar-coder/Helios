import React, { useState, useEffect } from 'react'
import { X, Shield, CreditCard, Building, Wallet, CheckCircle, ArrowRight, Copy, AlertCircle, Lock } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { StripeCardForm } from './StripeCardForm'

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
    description: 'Instant funding with any major card',
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

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '')
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
      <div className="funding-modal open">
        <div className="modal-backdrop" />
        <div className="modal-content">
          <div className="p-8 text-center">
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
      </div>
    )
  }

  // Method selection screen
  if (!selectedMethod) {
    const numericAmount = parseFloat(amount) || 0

    return (
      <div className="funding-modal open">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-content">
          <div className="modal-header">
            <h2>Fund Your Portfolio</h2>
            <button className="close-btn" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="funding-stats">
            <div className="stat">
              <span className="stat-label">Current Capital</span>
              <span className="stat-value">${(account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Available Capital</span>
              <span className="stat-value">${(account?.available_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Investor Status</span>
              <span className="stat-value premium">Qualified</span>
            </div>
          </div>
          
          <div className="amount-section">
            <h3>Investment Amount</h3>
            <div className="amount-input-group">
              <span className="currency">USD</span>
              <input 
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="amount-input"
              />
            </div>
            
            <div className="preset-amounts">
              <button onClick={() => setAmount('5000')}>$5,000</button>
              <button onClick={() => setAmount('10000')}>$10,000</button>
              <button onClick={() => setAmount('25000')}>$25,000</button>
              <button onClick={() => setAmount('50000')}>$50,000</button>
              <button onClick={() => setAmount('100000')} className="premium">$100,000+</button>
            </div>
          </div>
          
          <div className="funding-methods">
            <h3>Select Funding Method</h3>
            <div className="method-grid">
              {fundingMethods.map((method) => {
                const isAvailable = numericAmount >= method.minAmount && numericAmount <= method.maxAmount
                
                return (
                  <button 
                    key={method.id}
                    className={`method-card ${isAvailable ? '' : 'disabled'}`}
                    onClick={() => isAvailable && handleMethodSelect(method.id)}
                    disabled={!isAvailable}
                  >
                    <div className="method-icon">
                      <method.icon className="h-6 w-6" />
                    </div>
                    <span className="method-name">{method.name}</span>
                    <span className="method-time">{method.time}</span>
                    <span className="method-fee">{method.fee}</span>
                    {!isAvailable && numericAmount > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        ${method.minAmount.toLocaleString()} - ${method.maxAmount.toLocaleString()}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="compliance-note">
            <Shield className="shield-icon" />
            <p>
              <strong>Qualified Investor Protection</strong><br/>
              Your investment is processed through institutional-grade security protocols.
              All capital transfers are encrypted and comply with SEC regulations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Payment method form screen
  const selectedMethodData = fundingMethods.find(m => m.id === selectedMethod)!
  const numericAmount = parseFloat(amount)

  return (
    <div className="funding-modal open">
      <div className="modal-backdrop" onClick={() => setSelectedMethod(null)} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Investment Capital</h2>
          <div className="flex items-center space-x-2">
            <selectedMethodData.icon className="h-5 w-5 text-blue-600" />
            <span>{selectedMethodData.name}</span>
          </div>
          <button className="close-btn" onClick={() => setSelectedMethod(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {selectedMethod === 'card' && (
            <StripeCardForm 
              amount={numericAmount} 
              onSuccess={handlePaymentSuccess} 
              onError={handlePaymentError} 
              onClose={() => setSelectedMethod(null)}
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