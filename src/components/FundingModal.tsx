import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award } from 'lucide-react';
import { StripeCardForm } from './StripeCardForm';
import { EmptyPortfolioState } from './EmptyPortfolioState';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAmount?: number;
  onProceedToPayment?: (amount: number) => void;
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const [amount, setAmount] = useState(prefilledAmount || 1000);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);

  if (!isOpen) return null;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setShowEmptyState(false);
    setShowPaymentForm(true);
  };

  const handleProceedToPayment = () => {
    setShowEmptyState(false);
    setShowPaymentForm(true);
    onProceedToPayment?.(amount);
  };

  const handleBack = () => {
    setShowPaymentForm(false);
    setShowEmptyState(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : showPaymentForm ? 'Capital Transfer' : 'Fund Portfolio'}
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
          ) : showPaymentForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to Portfolio Setup
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Capital Transfer Amount</h3>
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
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}