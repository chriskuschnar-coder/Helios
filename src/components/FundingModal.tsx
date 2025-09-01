import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StripeCardForm } from './StripeCardForm';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import { DocumentSigningFlow } from './DocumentSigningFlow';
import { CongratulationsPage } from './CongratulationsPage';
import { useAuth } from './auth/AuthProvider';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAmount?: number;
  onProceedToPayment?: (amount: number) => void;
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const { account } = useAuth();
  const [amount, setAmount] = useState(prefilledAmount || 1000);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showDocumentSigning, setShowDocumentSigning] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showFundingForm, setShowFundingForm] = useState(false);

  if (!isOpen) return null;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
  };

  const handleProceedToPayment = () => {
    setShowEmptyState(false);
    setShowDocumentSigning(true);
  };

  const handleDocumentComplete = () => {
    setShowDocumentSigning(false);
    setShowCongratulations(true);
  };

  const handleContinueToPayment = () => {
    setShowCongratulations(false);
    setShowFundingForm(true);
  };

  const handleBackToPortfolio = () => {
    setShowDocumentSigning(false);
    setShowEmptyState(true);
  };

  const handleContinueToStripePayment = () => {
    if (amount >= 1000) {
      setShowFundingForm(false);
      setShowPaymentForm(true);
      onProceedToPayment?.(amount);
    }
  };

  const formatAmount = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : 
             showDocumentSigning ? 'Complete Onboarding Documents' : 
             showCongratulations ? 'Welcome to Global Markets!' :
             showFundingForm ? 'Fund Your Portfolio' :
             'Investment Amount'}
          </h1>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="px-8 pb-8">
          {showEmptyState ? (
            <EmptyPortfolioState 
              onFundAccount={handleProceedToPayment}
              onAmountSelect={handleAmountSelect}
            />
          ) : showDocumentSigning ? (
            <DocumentSigningFlow 
              onComplete={handleDocumentComplete}
              onBack={handleBackToPortfolio}
            />
          ) : showCongratulations ? (
            <CongratulationsPage 
              onContinueToPayment={handleContinueToPayment}
            />
          ) : showFundingForm ? (
            <div className="space-y-8">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    CURRENT CAPITAL
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${formatAmount(account?.balance || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    AVAILABLE CAPITAL
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${formatAmount(account?.available_balance || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    INVESTOR STATUS
                  </div>
                  <div className="text-3xl font-bold text-yellow-500">
                    Qualified
                  </div>
                </div>
              </div>

              {/* Investment Amount Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Investment Amount</h2>
                
                {/* Amount Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={`USD ${formatAmount(amount)}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const numValue = parseFloat(value) || 0;
                      setAmount(numValue);
                    }}
                    className="w-full px-8 py-6 text-4xl font-bold text-gray-600 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-300 transition-colors"
                    placeholder="USD 0.00"
                  />
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-5 gap-4">
                  {[5000, 10000, 25000, 50000, 100000].map((presetAmount, index) => (
                    <button
                      key={presetAmount}
                      onClick={() => setAmount(presetAmount)}
                      className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                        index === 4 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg' 
                          : amount === presetAmount
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                      }`}
                    >
                      ${index === 4 ? '100,000+' : presetAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Continue Button */}
                <div className="pt-8">
                  <button
                    onClick={handleContinueToStripePayment}
                    disabled={amount < 1000}
                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors"
                  >
                    Continue to Payment
                  </button>
                  {amount < 1000 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Minimum investment amount is $1,000
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : showPaymentForm ? (
            <div>
              <StripeCardForm 
                amount={amount}
                onSuccess={() => {
                  onClose();
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}