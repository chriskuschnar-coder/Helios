import React, { useState } from 'react'
import { X, CreditCard, Building, Coins, Zap, Shield, ArrowRight } from 'lucide-react'
import { StripeCardForm } from './StripeCardForm'

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledAmount?: number | null
  onProceedToPayment: (amount: number, method: string) => void
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [amount, setAmount] = useState(prefilledAmount || 1000)
  const [showCardForm, setShowCardForm] = useState(false)
  const [error, setError] = useState('')

  const fundingMethods = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: CreditCard,
      time: 'Instant',
      fee: '2.9% + $0.30',
      enabled: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      time: '1-3 business days',
      fee: 'Free',
      enabled: false
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      icon: Zap,
      time: 'Same day',
      fee: '$25',
      enabled: false
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Coins,
      time: '10-30 minutes',
      fee: 'Network fees',
      enabled: false
    }
  ]

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setAmount(Math.max(100, value))
    setError('')
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setError('')
    
    if (methodId === 'card') {
      setShowCardForm(true)
    } else {
      setShowCardForm(false)
    }
  }

  const handleProceed = () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }
    
    if (amount < 100) {
      setError('Minimum investment amount is $100')
      return
    }

    onProceedToPayment(amount, selectedMethod)
  }

  const handleCardSuccess = (result: any) => {
    console.log('Card payment successful:', result)
    onClose()
  }

  const handleCardError = (error: string) => {
    setError(error)
  }

  if (!isOpen) return null

  return (
    <div className="funding-modal open">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Fund Your Account</h2>
          <button className="close-btn" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="funding-stats">
          <div className="stat">
            <span className="stat-label">Current Balance</span>
            <div className="stat-value">$0</div>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <div className="stat-value">$0</div>
          </div>
          <div className="stat">
            <span className="stat-label">Status</span>
            <div className="stat-value premium">Active</div>
          </div>
        </div>

        {!showCardForm ? (
          <>
            <div className="funding-methods">
              <h3>Select Payment Method</h3>
              <div className="method-grid">
                {fundingMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`method-card ${selectedMethod === method.id ? 'active' : ''} ${!method.enabled ? 'disabled' : ''}`}
                    onClick={() => method.enabled && handleMethodSelect(method.id)}
                  >
                    <div className="method-icon">
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div className="method-name">{method.name}</div>
                    <div className="method-time">{method.time}</div>
                    <div className="method-fee">{method.fee}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="amount-section">
              <h3>Investment Amount</h3>
              <div className="amount-input-group">
                <span className="currency">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`amount-input ${error ? 'error' : ''}`}
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                />
              </div>
              {error && <div className="amount-error">{error}</div>}
              
              <div className="preset-amounts">
                {[1000, 5000, 10000, 25000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={preset >= 10000 ? 'premium' : ''}
                  >
                    ${preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="compliance-note">
              <Shield className="shield-icon" />
              <p>
                <strong>Secure & Compliant:</strong> All transactions are encrypted and processed 
                through our secure payment partners. Your investment is protected by industry-standard 
                security measures and regulatory compliance.
              </p>
            </div>

            <button
              className={`proceed-button ${selectedMethod && amount >= 100 ? 'enabled' : 'disabled'}`}
              onClick={handleProceed}
              disabled={!selectedMethod || amount < 100}
            >
              Proceed to Secure Checkout
              <ArrowRight className="arrow" />
            </button>
          </>
        ) : (
          <div className="p-6">
            <StripeCardForm
              amount={amount}
              onSuccess={handleCardSuccess}
              onError={handleCardError}
            />
            <button
              onClick={() => setShowCardForm(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Payment Methods
            </button>
          </div>
        )}
      </div>
    </div>
  )
}