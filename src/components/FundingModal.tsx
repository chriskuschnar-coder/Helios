import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award, CreditCard, Building, Zap, Coins, ArrowRight, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import { DocumentSigningFlow } from './DocumentSigningFlow';
import { CongratulationsPage } from './CongratulationsPage';
import { useAuth } from './auth/AuthProvider';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51S2OIF3aD6OJYuckOW7RhBZ9xG0fHNkFSKCYVeRBjFMeusz0P9tSIvRyja7LY55HHhuhrgc5UZR6v78SrM9CE25300XPf5I5z4');

// Payment form component for the modal
function ModalCheckoutForm({ amount, onSuccess, onError }: { amount: number, onSuccess: (result: any) => void, onError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onError('Stripe not loaded');
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/funding-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        onSuccess({ success: true });
      }
    } catch (err) {
      onError('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const processingFee = amount * 0.029 + 0.30;
  const totalCharge = amount + processingFee;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-900">Live Payment Processing</span>
        </div>
        <p className="text-sm text-green-700">
          <strong>LIVE MODE:</strong> Your payment information is encrypted and processed securely by Stripe. Real charges will be made.
        </p>
      </div>

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: ''
              }
            }
          }}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Investment Amount:</span>
          <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-sm">Processing fee (2.9% + $0.30):</span>
          <span className="text-gray-600 text-sm">${processingFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total charge:</span>
            <span className="font-bold text-gray-900">${totalCharge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Investment - ${amount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
}

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAmount?: number | null;
  onProceedToPayment?: (amount: number, method: string) => void;
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const { account, user, markDocumentsCompleted } = useAuth();
  const [amount, setAmount] = useState(prefilledAmount || 10000);
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
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setInvestmentAmount(selectedAmount.toLocaleString());
    setShowEmptyState(false);
    setShowFundingPage(true);
  };

  const handleProceedToPayment = () => {
    // Check if user has already completed documents
    if (user?.documents_completed) {
      // Skip documents, go straight to funding page
      setShowEmptyState(false);
      setShowFundingPage(true);
    } else {
      // First time investor - show document signing
      setShowEmptyState(false);
      setShowDocumentSigning(true);
    }
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
    // Mark documents as completed in database
    markDocumentsCompleted();
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
    setAmount(amount);
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
        createPaymentIntent(numericAmount);
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

  const createPaymentIntent = async (paymentAmount: number) => {
    if (!user) {
      setError('Please sign in to continue');
      return;
    }

    setCreatingPayment(true);
    setError('');

    try {
      console.log('💳 Creating payment intent for amount:', paymentAmount);
      
      const { supabaseClient } = await import('../lib/supabase-client');
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          amount: paymentAmount * 100, // Convert to cents
          currency: 'usd',
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        
        let errorMessage = 'Failed to initialize payment';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
            errorMessage = 'Payment service temporarily unavailable. Please try again.';
          } else {
            errorMessage = errorText.substring(0, 100);
          }
        }
        
        throw new Error(errorMessage);
      }

      const { client_secret } = await response.json();
      setClientSecret(client_secret);
      setShowFundingPage(false);
      setShowPaymentForm(true);
      console.log('✅ Payment intent created successfully');
      
    } catch (error) {
      console.error('❌ Payment intent creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setCreatingPayment(false);
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
    setClientSecret(null);
    setShowWireInstructions(false);
    setShowBankTransfer(false);
    setShowCryptoPayment(false);
    setShowFundingPage(true);
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Payment successful:', result);
    setShowPaymentForm(false);
    setClientSecret(null);
    setError('');
    onClose();
    // Refresh the page to update account balance
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);
    setError(error);
    // Don't close the payment form - let user try again
    // setShowPaymentForm(false);
    // setClientSecret(null);
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
             showPaymentForm ? 'Secure Payment' :
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
          ) : showPaymentForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setClientSecret(null);
                    setShowFundingPage(true);
                  }}
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

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' as const } }}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-900 font-medium">{error}</span>
                      </div>
                    </div>
                  )}
                  <ModalCheckoutForm 
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing secure payment...</p>
                </div>
              )}
            </div>
          ) : showFundingPage ? (
            <div>
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  {user?.documents_completed ? '← Back to Portfolio' : '← Back to Portfolio Setup'}
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
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-900 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedWithPayment}
                disabled={!investmentAmount || !selectedPaymentMethod || creatingPayment}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
              >
                {creatingPayment ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Initializing Payment...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
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
                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-navy-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cryptocurrency Payment</h3>
                <p className="text-gray-600">
                  Send cryptocurrency for ${investmentAmount} investment
                </p>
              </div>

              {/* Cryptocurrency Selection */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Select Cryptocurrency</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedCrypto('bitcoin')}
                    className={`border-2 rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      selectedCrypto === 'bitcoin' 
                        ? 'border-navy-600 bg-navy-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl font-bold text-navy-600 mb-3">₿</div>
                    <div className="font-medium text-gray-900">Bitcoin (BTC)</div>
                    <div className="text-sm text-gray-600 mt-2">Network fee: ~$15</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedCrypto('ethereum')}
                    className={`border-2 rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      selectedCrypto === 'ethereum' 
                        ? 'border-navy-600 bg-navy-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl font-bold text-navy-600 mb-3">Ξ</div>
                    <div className="font-medium text-gray-900">Ethereum (ETH)</div>
                    <div className="text-sm text-gray-600 mt-2">Network fee: ~$25</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedCrypto('usdt')}
                    className={`border-2 rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      selectedCrypto === 'usdt' 
                        ? 'border-navy-600 bg-navy-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl font-bold text-navy-600 mb-3">₮</div>
                    <div className="font-medium text-gray-900">Tether (USDT)</div>
                    <div className="text-sm text-gray-600 mt-2">Network fee: ~$5</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedCrypto('solana')}
                    className={`border-2 rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      selectedCrypto === 'solana' 
                        ? 'border-navy-600 bg-navy-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl font-bold text-navy-600 mb-3">◎</div>
                    <div className="font-medium text-gray-900">Solana (SOL)</div>
                    <div className="text-sm text-gray-600 mt-2">Network fee: ~$0.01</div>
                  </button>
                </div>
              </div>

              {/* Payment Address - Only show when crypto is selected */}
              {selectedCrypto && (
                <div className="bg-navy-50 border border-navy-200 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-navy-900 mb-3">
                    {selectedCrypto === 'bitcoin' && 'Bitcoin Payment Address'}
                    {selectedCrypto === 'ethereum' && 'Ethereum Payment Address'}
                    {selectedCrypto === 'usdt' && 'USDT Payment Address (ERC-20)'}
                    {selectedCrypto === 'solana' && 'Solana Payment Address'}
                  </h4>
                  
                  {/* Amount to Send */}
                  <div className="bg-white border border-navy-200 rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-navy-900 mb-2">Amount to Send</div>
                    <div className="text-2xl font-bold text-navy-900">
                      {selectedCrypto === 'bitcoin' && `${(parseInt(investmentAmount.replace(/,/g, '')) / 106250).toFixed(6)} BTC`}
                      {selectedCrypto === 'ethereum' && `${(parseInt(investmentAmount.replace(/,/g, '')) / 3195).toFixed(4)} ETH`}
                      {selectedCrypto === 'usdt' && `${parseInt(investmentAmount.replace(/,/g, '')).toLocaleString()} USDT`}
                      {selectedCrypto === 'solana' && `${(parseInt(investmentAmount.replace(/,/g, '')) / 245).toFixed(2)} SOL`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      USD Value: ${parseInt(investmentAmount.replace(/,/g, '')).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm break-all">
                        {selectedCrypto === 'bitcoin' && 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                        {selectedCrypto === 'ethereum' && '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C'}
                        {selectedCrypto === 'usdt' && '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C'}
                        {selectedCrypto === 'solana' && '7xKXtg2CW87d97TXJLAuBjbTiSASaUvSMYQoQdu9ijSm'}
                      </span>
                      <button
                        onClick={() => {
                          const address = selectedCrypto === 'bitcoin' ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' :
                                        selectedCrypto === 'ethereum' ? '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C' :
                                        selectedCrypto === 'usdt' ? '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C' :
                                        '7xKXtg2CW87d97TXJLAuBjbTiSASaUvSMYQoQdu9ijSm';
                          copyToClipboard(address, selectedCrypto);
                        }}
                        className="p-1 hover:bg-gray-100 rounded ml-2"
                      >
                        {copiedField === selectedCrypto ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-navy-700">
                    <strong>Important:</strong> 
                    {selectedCrypto === 'bitcoin' && ' Only send Bitcoin to this address. Sending other cryptocurrencies will result in permanent loss.'}
                    {selectedCrypto === 'ethereum' && ' Only send Ethereum to this address. Ensure you\'re using the Ethereum network.'}
                    {selectedCrypto === 'usdt' && ' Only send USDT (ERC-20) to this address. Ensure you\'re using the Ethereum network.'}
                    {selectedCrypto === 'solana' && ' Only send Solana (SOL) to this address. Ultra-fast transactions with minimal fees.'}
                  </div>
                </div>
              )}

              {/* Payment Instructions - Only show when crypto is selected */}
              {selectedCrypto && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-navy-600" />
                    <span className="font-medium text-navy-900">Payment Instructions</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Amount to send:</strong> 
                      {selectedCrypto === 'bitcoin' && ` ${(parseInt(investmentAmount.replace(/,/g, '')) / 106250).toFixed(6)} BTC`}
                      {selectedCrypto === 'ethereum' && \` ${(parseInt(investmentAmount.replace(/,/g, '')) / 3195).toFixed(4)} ETH`}
                      {selectedCrypto === 'usdt' && \` ${parseInt(investmentAmount.replace(/,/g, '')).toLocaleString()} USDT (ERC-20 only)`}
                      {selectedCrypto === 'solana' && \` ${(parseInt(investmentAmount.replace(/,/g, '')) / 245).toFixed(2)} SOL`}
                    </li>
                    <li>• Reference code: <strong>GMC-{selectedCrypto.toUpperCase()}-{Date.now().toString().slice(-6)}</strong></li>
                    <li>• Confirmations required: 
                      {selectedCrypto === 'bitcoin' && ' 3 blocks (~30 minutes)'}
                      {selectedCrypto === 'ethereum' && ' 12 blocks (~3 minutes)'}
                      {selectedCrypto === 'usdt' && ' 12 blocks (~3 minutes)'}
                      {selectedCrypto === 'solana' && ' 1 block (~1 second)'}
                    </li>
                    <li>• Contact support if payment doesn't appear within 2 hours</li>
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  // In production, this would create the crypto invoice
                  console.log('Creating crypto payment invoice for:', selectedCrypto, investmentAmount);
                  onClose();
                }}
                disabled={!selectedCrypto}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors"
              >
                {selectedCrypto ? \`I've Sent the ${selectedCrypto.charAt(0).toUpperCase() + selectedCrypto.slice(1)}` : 'Select Cryptocurrency First'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}