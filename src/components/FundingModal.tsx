import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award, CreditCard, Building, Zap, Coins, ArrowRight } from 'lucide-react';
import { StripeCardForm } from './StripeCardForm';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import { DocumentSigningFlow } from './DocumentSigningFlow';
import { CongratulationsPage } from './CongratulationsPage';
import { useAuth } from './auth/AuthProvider';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAmount?: number | null;
  onProceedToPayment?: (amount: number, method: string) => void;
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const { account } = useAuth();
  const [amount, setAmount] = useState(prefilledAmount || 1000);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showDocumentSigning, setShowDocumentSigning] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showFundingPage, setShowFundingPage] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  if (!isOpen) return null;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setShowEmptyState(false);
    setShowPaymentForm(true);
  };

  const handleProceedToPayment = () => {
    setShowEmptyState(false);
    setShowDocumentSigning(true);
  };

  const handleBack = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
      setShowFundingPage(true);
    } else if (showFundingPage) {
      setShowFundingPage(false);
      setShowCongratulations(true);
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
    setShowCongratulations(true);
  };

  const handleContinueToPayment = () => {
    setShowCongratulations(false);
    setShowFundingPage(true);
  };

  const handleBackToPortfolio = () => {
    setShowDocumentSigning(false);
    setShowEmptyState(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      setInvestmentAmount(parseInt(value).toLocaleString());
    } else {
      setInvestmentAmount('');
    }
  };

  const handlePresetAmountSelect = (amount: number) => {
    setInvestmentAmount(amount.toLocaleString());
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedWithPayment = () => {
    if (investmentAmount && selectedPaymentMethod) {
      const numericAmount = parseInt(investmentAmount.replace(/,/g, ''));
      setAmount(numericAmount);
      setShowFundingPage(false);
      setShowPaymentForm(true);
      onProceedToPayment?.(numericAmount, selectedPaymentMethod);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Instant processing',
      fee: 'No fees'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: '1-3 business days',
      fee: 'No fees'
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      icon: Zap,
      description: 'Same day processing',
      fee: '$25 fee'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Coins,
      description: 'Bitcoin, Ethereum',
      fee: 'Network fees apply'
    }
  ];

  const presetAmounts = [5000, 10000, 25000, 50000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : 
             showDocumentSigning ? 'Complete Onboarding Documents' : 
             showCongratulations ? 'Welcome to Global Markets!' :
             showFundingPage ? 'Investment Amount' :
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
          ) : showDocumentSigning ? (
            <DocumentSigningFlow 
              onComplete={handleDocumentComplete}
              onBack={handleBackToPortfolio}
            />
          ) : showCongratulations ? (
            <CongratulationsPage 
              onContinueToPayment={handleContinueToPayment}
            />
          ) : showFundingPage ? (
            <div>
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Portfolio Setup
                </button>
              </div>

              {/* Account Status Header */}
              <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                    Current Capital
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(account?.balance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                    Available Capital
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(account?.available_balance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                    Investor Status
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    Qualified
                  </div>
                </div>
              </div>

              {/* Investment Amount Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Amount</h3>
                
                {/* Amount Input */}
                <div className="relative mb-6">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-semibold">
                    USD
                  </div>
                  <input
                    type="text"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full pl-20 pr-6 py-6 text-3xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetAmountSelect(preset)}
                      className="py-4 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => setInvestmentAmount('100000')}
                    className="py-4 px-4 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-all"
                  >
                    $100,000+
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <method.icon className="h-6 w-6 text-gray-600" />
                        <span className="font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                      <div className="text-xs text-green-600 font-medium mt-1">{method.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>SIPC Protected up to $500,000</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-green-600" />
                  <span>SEC Registered Investment Advisor</span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedWithPayment}
                disabled={!investmentAmount || !selectedPaymentMethod}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
              >
                Proceed to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          ) : showPaymentForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Investment Amount
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