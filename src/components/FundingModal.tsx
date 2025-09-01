import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Building2, Zap, Coins } from 'lucide-react';
import { StripeCardForm } from './StripeCardForm';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  availableBalance: number;
}

export function FundingModal({ isOpen, onClose, currentBalance, availableBalance }: FundingModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState(10000);

  if (!isOpen) return null;

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
  };

  const calculateFee = (amount: number) => {
    return Math.round((amount * 0.029 + 0.30) * 100) / 100;
  };

  const fee = calculateFee(amount);
  const total = amount + fee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Capital</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Account Status */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">CURRENT BALANCE</div>
              <div className="text-2xl font-bold">${currentBalance.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">AVAILABLE</div>
              <div className="text-2xl font-bold">${availableBalance.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">STATUS</div>
              <div className="text-xl font-semibold text-amber-600">Active</div>
            </div>
          </div>

          {!selectedMethod ? (
            <>
              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Select Transfer Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleMethodSelect('card')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-lg mb-1">Debit/Credit Card</div>
                    <div className="text-sm text-gray-500 mb-2">Instant</div>
                    <div className="text-green-600 font-medium">2.9% + $0.30</div>
                  </button>

                  <button
                    onClick={() => handleMethodSelect('bank')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-left opacity-50 cursor-not-allowed"
                  >
                    <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-lg mb-1">Bank Transfer</div>
                    <div className="text-sm text-gray-500 mb-2">1-3 business days</div>
                    <div className="text-green-600 font-medium">Free</div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button
                    onClick={() => handleMethodSelect('wire')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-left opacity-50 cursor-not-allowed"
                  >
                    <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-lg mb-1">Wire Transfer</div>
                    <div className="text-sm text-gray-500 mb-2">Same day</div>
                    <div className="text-green-600 font-medium">$25</div>
                  </button>

                  <button
                    onClick={() => handleMethodSelect('crypto')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-left opacity-50 cursor-not-allowed"
                  >
                    <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mb-4">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-lg mb-1">Cryptocurrency</div>
                    <div className="text-sm text-gray-500 mb-2">10-30 minutes</div>
                    <div className="text-green-600 font-medium">Network fees</div>
                  </button>
                </div>
              </div>

              {/* Investment Amount */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Capital Contribution</h3>
                    <p className="text-gray-600">Contribute capital to our hedge fund with flexible amounts starting from $100</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="100"
                      step="100"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Minimum investment: $100</p>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1000, 5000, 10000, 25000].map((presetAmount) => (
                    <button
                      key={presetAmount}
                      onClick={() => handleAmountSelect(presetAmount)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        amount === presetAmount
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${presetAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium text-blue-900">Secure & Compliant</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    All transactions are encrypted and processed through our secure payment partners. 
                    Your investment is protected by industry-standard security measures and regulatory compliance.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <StripeCardForm 
              amount={amount}
              onSuccess={() => {
                onClose();
                window.location.reload();
              }}
              onCancel={() => setSelectedMethod(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}