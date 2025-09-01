import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award, CreditCard, Building, Zap } from 'lucide-react';
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
    setShowFundingForm(true);
  };

  const handleProceedToPayment = () => {
    setShowEmptyState(false);
    setShowDocumentSigning(true);
  };

  const handleBack = () => {
    if (showFundingForm) {
      setShowFundingForm(false);
      setShowCongratulations(true);
    } else if (showPaymentForm) {
      setShowPaymentForm(false);
      setShowFundingForm(true);
    } else if (showCongratulations) {
      setShowCongratulations(false);
      setShowDocumentSigning(true);
    } else if (showDocumentSigning) {
      setShowDocumentSigning(false);
      setShowEmptyState(true);
    }
  };

  const handleDocumentComplete = () => {
    setShowDocumentSigning(false);
    setShowFundingForm(true);
  };

  const handleContinueToPayment = () => {
    setShowFundingForm(false);
    setShowPaymentForm(true);
    onProceedToPayment?.(amount);
  };

  const handleBackToPortfolio = () => {
    setShowDocumentSigning(false);
    setShowEmptyState(true);
  };

  const presetAmounts = [5000, 10000, 25000, 50000];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : 
             showFundingForm ? 'Fund Your Portfolio' :
             showDocumentSigning ? 'Complete Onboarding Documents' : 
             showCongratulations ? 'Welcome to Global Markets!' :
             'Investment Amount'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {showEmptyState ? (
            <EmptyPortfolioState 
              onFundAccount={handleProceedToPayment}
              onAmountSelect={handleAmountSelect}
            />
          ) : showFundingForm ? (
            <div className="max-w-3xl mx-auto">
              {/* Account Status Cards */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Current Capital
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${(account?.balance || 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Available Capital
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${(account?.available_balance || 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Investor Status
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    Qualified
                  </div>
                </div>
              </div>

              {/* Investment Amount Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Amount</h3>
                
                {/* Amount Input */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={`USD ${amount.toLocaleString()}.00`}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setAmount(parseInt(value) || 0);
                      }}
                      className="w-full text-4xl font-light text-gray-600 bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-8 focus:outline-none focus:border-navy-500 transition-colors"
                      placeholder="USD 0.00"
                    />
                  </div>
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-5 gap-4">
                  {presetAmounts.map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => setAmount(presetAmount)}
                      className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        amount === presetAmount
                          ? 'border-navy-500 bg-navy-50 text-navy-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      ${presetAmount.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(100000)}
                    className={`px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                      amount >= 100000
                        ? 'border-yellow-500 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 hover:from-yellow-100 hover:to-yellow-200'
                    }`}
                  >
                    $100,000+
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleContinueToPayment}
                  disabled={amount < 1000}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Continue to Payment
                </button>
              </div>

              {amount < 1000 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Minimum investment amount is $1,000
                </p>
              )}
            </div>
          ) : showDocumentSigning ? (
            <DocumentSigningFlow 
              onComplete={handleDocumentComplete}
              onBack={handleBackToPortfolio}
            />
          ) : showCongratulations ? (
            <CongratulationsPage 
              onContinueToPayment={handleContinueToPayment}
            />
          ) : showPaymentForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Portfolio Setup
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Investment Amount</h3>
                    <p className="text-blue-700">${amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>SIPC Protected up to $500,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>SEC Registered Investment Advisor</span>
                </div>
              </div>

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