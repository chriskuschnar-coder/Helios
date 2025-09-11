import React, { useState } from 'react'
import { X, CreditCard, Building2, Smartphone, DollarSign } from 'lucide-react'
import StripeCardForm from './StripeCardForm'
import { NOWPaymentsCrypto } from './NOWPaymentsCrypto'

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledAmount?: number | null
}

export const FundingModal: React.FC<FundingModalProps> = ({ 
  isOpen, 
  onClose, 
  prefilledAmount 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'crypto' | 'wire'>('stripe')
  const [amount, setAmount] = useState(prefilledAmount?.toString() || '')

  if (!isOpen) return null

  const fundingMethods = [
    {
      id: 'stripe' as const,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Instant funding with Visa, Mastercard, or American Express',
      processingTime: 'Instant',
      fees: '2.9% + $0.30'
    },
    {
      id: 'crypto' as const,
      name: 'Cryptocurrency',
      icon: Smartphone,
      description: 'Fund with Bitcoin, Ethereum, USDT, or other cryptocurrencies',
      processingTime: '10-30 minutes',
      fees: '1.5%'
    },
    {
      id: 'wire' as const,
      name: 'Wire Transfer',
      icon: Building2,
      description: 'Bank wire transfer for larger amounts',
      processingTime: '1-3 business days',
      fees: '$25 flat fee'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-navy-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Fund Your Portfolio</h2>
              <p className="text-sm text-gray-600">Choose your preferred funding method</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-lg"
              placeholder="10,000"
              min="1000"
              step="100"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Minimum investment: $1,000
          </p>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
          
          <div className="space-y-3 mb-6">
            {fundingMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 border rounded-lg text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-navy-500 bg-navy-50 ring-2 ring-navy-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id ? 'bg-navy-100' : 'bg-gray-100'
                  }`}>
                    <method.icon className={`h-5 w-5 ${
                      selectedMethod === method.id ? 'text-navy-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{method.fees}</div>
                        <div className="text-xs text-gray-500">{method.processingTime}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Payment Form */}
          {selectedMethod === 'stripe' && (
            <StripeCardForm 
              amount={parseFloat(amount) || 0}
              onSuccess={onClose}
            />
          )}

          {selectedMethod === 'crypto' && (
            <NOWPaymentsCrypto 
              amount={parseFloat(amount) || 0}
              onSuccess={onClose}
            />
          )}

          {selectedMethod === 'wire' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Wire Transfer Instructions</h4>
              <p className="text-sm text-blue-800 mb-3">
                Wire transfer details will be provided after you confirm the amount.
              </p>
              <button
                onClick={() => {
                  alert('Wire transfer instructions will be sent to your email')
                  onClose()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Get Wire Instructions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}