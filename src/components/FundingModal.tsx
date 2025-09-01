import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award, CreditCard, Building, Zap, Coins, ArrowRight, Copy, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [showWireInstructions, setShowWireInstructions] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [wireInstructions, setWireInstructions] = useState(null);
  const [copiedField, setCopiedField] = useState('');

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
      
      // Route to different payment flows based on method
      if (selectedPaymentMethod === 'card') {
        setShowFundingPage(false);
        setShowPaymentForm(true);
      } else if (selectedPaymentMethod === 'wire') {
        generateWireInstructions(numericAmount);
        setShowFundingPage(false);
        setShowWireInstructions(true);
      } else if (selectedPaymentMethod === 'bank') {
        setShowFundingPage(false);
        setShowBankTransfer(true);
      } else if (selectedPaymentMethod === 'crypto') {
        setShowFundingPage(false);
        setShowCryptoPayment(true);
      }
    }
  };

  const generateWireInstructions = (amount: number) => {
    // Generate random reference code
    const referenceCode = 'GMC' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    setWireInstructions({
      amount: amount,
      referenceCode: referenceCode,
      bankName: 'JPMorgan Chase Bank, N.A.',
      routingNumber: '021000021',
      accountNumber: '4567890123',
      accountName: 'Global Market Consulting LLC',
      swiftCode: 'CHASUS33',
      bankAddress: '270 Park Avenue, New York, NY 10017',
      beneficiaryAddress: '200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131'
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleBackToFunding = () => {
    setShowPaymentForm(false);
    setShowWireInstructions(false);
    setShowBankTransfer(false);
    setShowCryptoPayment(false);
    setShowFundingPage(true);
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
                  onClick={handleBackToFunding}
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
                onSuccess={(result) => {
                  console.log('✅ Payment successful:', result)
                  onClose();
                  // Optionally refresh account data
                  window.location.reload();
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                  // Keep modal open to show error
                }}
              />
            </div>
          ) : showWireInstructions ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Important Instructions</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please include the reference code in your wire transfer. Processing typically takes 1-2 business days.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Investment Amount</div>
                      <div className="text-2xl font-bold text-gray-900">${wireInstructions?.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Reference Code</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-bold text-blue-600">{wireInstructions?.referenceCode}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.referenceCode, 'reference')}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedField === 'reference' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Name</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-medium">{wireInstructions?.bankName}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.bankName, 'bankName')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'bankName' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Routing Number</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.routingNumber}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.routingNumber, 'routing')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'routing' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Number</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.accountNumber, 'account')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'account' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Name</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-medium">{wireInstructions?.accountName}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.accountName, 'accountName')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'accountName' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">SWIFT Code</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.swiftCode}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.swiftCode, 'swift')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'swift' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Address</label>
                      <div className="bg-white border rounded-lg p-3">
                        <span className="text-sm">{wireInstructions?.bankAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Wire Transfer Notes</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Include reference code: <strong>{wireInstructions?.referenceCode}</strong></li>
                    <li>• Processing time: 1-2 business days</li>
                    <li>• Wire fee: $25 (charged by your bank)</li>
                    <li>• International wires may take 3-5 business days</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    // Mark as completed and close modal
                    onClose();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors mt-6"
                >
                  I've Sent the Wire Transfer
                </button>
              </div>
            </div>
          ) : showBankTransfer ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer Setup</h3>
                <p className="text-gray-600">
                  Connect your bank account for ${investmentAmount} investment
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Secure Bank Connection</span>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  We use Plaid to securely connect to your bank account. Your login credentials are encrypted and never stored.
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Bank-level security (256-bit encryption)</li>
                  <li>• No fees for ACH transfers</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Supports 11,000+ financial institutions</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // In production, this would open Plaid Link
                    alert('Plaid integration will be implemented here. This would open a secure bank connection flow.');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Building className="h-5 w-5 mr-2" />
                  Connect Bank Account Securely
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Powered by Plaid • Used by millions of users
                  </p>
                </div>
              </div>
            </div>
          ) : showCryptoPayment ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cryptocurrency Payment</h3>
                <p className="text-gray-600">
                  Pay ${investmentAmount} with Bitcoin or Ethereum
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-orange-500 bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">₿</div>
                  <div className="font-medium text-gray-900">Bitcoin (BTC)</div>
                  <div className="text-sm text-gray-600">Network fee: ~$15</div>
                  <div className="text-sm text-orange-600 font-medium mt-2">
                    ≈ {(parseInt(investmentAmount.replace(/,/g, '')) / 106250).toFixed(6)} BTC
                  </div>
                </div>
                
                <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-4 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Ξ</div>
                  <div className="font-medium text-gray-900">Ethereum (ETH)</div>
                  <div className="text-sm text-gray-600">Network fee: ~$25</div>
                  <div className="text-sm text-purple-600 font-medium mt-2">
                    ≈ {(parseInt(investmentAmount.replace(/,/g, '')) / 3195).toFixed(4)} ETH
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-orange-900 mb-3">Bitcoin Payment Address</h4>
                <div className="bg-white border rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                    <button
                      onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'btc')}
                      className="p-1 hover:bg-gray-100 rounded ml-2"
                    >
                      {copiedField === 'btc' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-orange-700">
                  <strong>Important:</strong> Only send Bitcoin to this address. Sending other cryptocurrencies will result in permanent loss.
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Crypto Payment Instructions</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Send exact amount: {(parseInt(investmentAmount.replace(/,/g, '')) / 106250).toFixed(6)} BTC</li>
                  <li>• Include memo/note: {wireInstructions?.referenceCode}</li>
                  <li>• Confirmations required: 3 blocks (~30 minutes)</li>
                  <li>• Contact support if payment doesn't appear within 2 hours</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  // Mark as completed and close modal
                  onClose();
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                I've Sent the Cryptocurrency
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}