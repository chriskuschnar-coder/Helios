import React, { useState } from 'react'
import { X, CreditCard, Building, Zap } from 'lucide-react'
import { DocumentSigningFlow } from './DocumentSigningFlow';

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledAmount?: number | null
  onProceedToPayment: (amount: number, method: string) => void
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const [amount, setAmount] = useState(prefilledAmount?.toString() || '')
  const [selectedMethod, setSelectedMethod] = useState('stripe')

  const [showDocumentSigning, setShowDocumentSigning] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (numAmount > 0) {
      onProceedToPayment(numAmount, selectedMethod)
    }
  }
  
  const handleStartOnboarding = () => {
    setShowEmptyState(false);
    setShowDocumentSigning(true);
  };

  const handleOnboardingComplete = () => {
    setShowDocumentSigning(false);
    setShowPaymentForm(true);
  };

  const handleBack = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
      setShowEmptyState(true);
    } else if (showDocumentSigning) {
      setShowDocumentSigning(false);
      setShowEmptyState(true);
    }
  }
  
  const quickAmounts = [10000, 25000, 50000, 100000]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : 
             showDocumentSigning ? 'Investment Documentation' :
             showPaymentForm ? 'Capital Transfer' : 'Fund Portfolio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="1000"
                step="1000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum investment: $1,000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ${quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="method"
                  value="stripe"
                  checked={selectedMethod === 'stripe'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Instant funding via Stripe</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="method"
                  value="wire"
                  checked={selectedMethod === 'wire'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <Building className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Wire Transfer</div>
                  <div className="text-sm text-gray-500">1-3 business days</div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) < 1000}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Payment
          </button>
        </form>
      </div>
      
      {/* Nested Document Signing Modal */}
      {showDocumentSigning && (
        <DocumentSigningFlow
          isOpen={showDocumentSigning}
          onClose={() => {
            setShowDocumentSigning(false);
            setShowEmptyState(true);
          }}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  )
}