'use client'

import { useState } from 'react'
import { X, CreditCard, Wallet, Building, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface SecureFundingModalProps {
  isOpen: boolean
  onClose: () => void
  onFundingComplete: (amount: number, method: string) => void
}

export function SecureFundingModal({ isOpen, onClose, onFundingComplete }: SecureFundingModalProps) {
  const [step, setStep] = useState(1)
  const [fundingAmount, setFundingAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('bank')
  const [isProcessing, setIsProcessing] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const amount = parseFloat(fundingAmount)
      onFundingComplete(amount, selectedMethod)
      onClose()
      setStep(1)
      setFundingAmount('')
      setSelectedMethod('bank')
      setAgreedToTerms(false)
    } catch (error) {
      console.error('Funding error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer (ACH)',
      description: '1-3 business days • No fees',
      icon: Building,
      secure: true,
      instant: false
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      description: 'Same day • $25 fee',
      icon: CreditCard,
      secure: true,
      instant: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Instant • BTC, ETH, USDC',
      icon: Wallet,
      secure: true,
      instant: true
    },
    {
      id: 'card',
      name: 'Debit Card',
      description: 'Instant • 2.9% fee',
      icon: CreditCard,
      secure: true,
      instant: true
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Secure Account Funding</h2>
            <p className="text-sm text-gray-600 mt-1">Add capital to your trading account</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Bank-Level Security</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your funds are protected by 256-bit encryption, segregated accounts, and FDIC insurance up to $250,000.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Amount */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="100"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Minimum: $100</span>
                  <span>Maximum: $250,000 per transaction</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <method.icon className="h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-xs text-gray-600">{method.description}</div>
                      </div>
                      {method.secure && (
                        <Shield className="h-4 w-4 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!fundingAmount || parseFloat(fundingAmount) < 100}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continue to Verification
              </button>
            </div>
          )}

          {/* Step 2: Compliance */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Verification</h3>
                
                {/* KYC Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Identity Verification Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Federal regulations require identity verification for transactions over $100.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mock KYC Process */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={kycVerified}
                      onChange={(e) => setKycVerified(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I have completed identity verification (KYC)
                    </span>
                    {kycVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the Terms of Service and Risk Disclosures
                    </span>
                    {agreedToTerms && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!kycVerified || !agreedToTerms}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Processing */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Processing</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-lg font-bold text-gray-900">${parseFloat(fundingAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="text-sm text-gray-900">
                      {paymentMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Time</span>
                    <span className="text-sm text-gray-900">
                      {selectedMethod === 'bank' ? '1-3 business days' : 
                       selectedMethod === 'wire' ? 'Same day' : 'Instant'}
                    </span>
                  </div>
                </div>

                {/* Payment Method Specific UI */}
                {selectedMethod === 'bank' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Bank Transfer Instructions</h4>
                    <p className="text-sm text-blue-800">
                      You will be redirected to securely connect your bank account through Plaid.
                      Your login credentials are never stored.
                    </p>
                  </div>
                )}

                {selectedMethod === 'crypto' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Cryptocurrency Deposit</h4>
                    <p className="text-sm text-purple-800">
                      A unique wallet address will be generated for your deposit.
                      Supported: BTC, ETH, USDC, USDT
                    </p>
                  </div>
                )}

                {selectedMethod === 'wire' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Wire Transfer Details</h4>
                    <p className="text-sm text-green-800">
                      Wire transfer instructions will be provided after confirmation.
                      Same-day processing with $25 fee.
                    </p>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Debit Card Payment</h4>
                    <p className="text-sm text-orange-800">
                      Instant funding with 2.9% processing fee.
                      Processed securely through Stripe.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Funding'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer Disclaimer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <p className="text-xs text-gray-600 text-center">
            <strong>Security Notice:</strong> All transactions are encrypted and monitored for fraud.
            Funds are held in segregated accounts with FDIC insurance protection.
          </p>
        </div>
      </div>
    </div>
  )
}