import React from 'react'
import { TrendingUp, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { DisabledFundingButton } from './DisabledFundingButton'

interface EmptyPortfolioStateProps {
  onFundAccount: () => void
  onAmountSelect: (amount: number) => void
}

export function EmptyPortfolioState({ onFundAccount, onAmountSelect }: EmptyPortfolioStateProps) {
  const { user, profile } = useAuth()

  // If user has completed documents, show different messaging
  const hasCompletedDocuments = user?.documents_completed || profile?.documents_completed || false
  const kycStatus = user?.kyc_status || 'unverified'
  const isKYCVerified = kycStatus === 'verified'

  const handleProceedToPayment = () => {
    // Check if user has already completed documents AND KYC verification
    if (user?.documents_completed && user?.kyc_status === 'verified') {
      // Both documents and KYC complete - go straight to funding page
      setShowEmptyState(false);
      setShowFundingPage(true);
    } else if (user?.documents_completed && user?.kyc_status !== 'verified') {
      // Documents complete but KYC not verified - go to KYC verification
      setShowEmptyState(false);
      setShowKYCVerification(true);
    } else {
      // First time investor - show document signing
      setShowEmptyState(false);
      setShowDocumentSigning(true);
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-12 h-12 text-navy-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-4">
          {hasCompletedDocuments && isKYCVerified ? 'Add Capital to Your Account' : 
           hasCompletedDocuments ? 'Complete Identity Verification' : 'Activate Your Account'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          {hasCompletedDocuments && isKYCVerified
            ? 'Add additional capital to your existing managed account. Your onboarding and verification are complete.'
            : hasCompletedDocuments
            ? 'Complete identity verification to unlock funding capabilities. This one-time process ensures regulatory compliance.'
            : 'Begin your journey with our quantitative strategies. Complete the onboarding process to access institutional-grade portfolio management.'
          }
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Shield className="w-4 h-4 text-green-600" />
          <span>SIPC Protected up to $500,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Award className="w-4 h-4 text-green-600" />
          <span>SEC Registered Investment Advisor</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Institutional-Grade Risk Management</span>
        </div>
      </div>

      <DisabledFundingButton
        kycStatus={kycStatus}
        hasCompletedDocuments={hasCompletedDocuments}
        onClick={onFundAccount}
        className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg"
      >
        {hasCompletedDocuments && isKYCVerified ? 'Add Account Capital' : 
         hasCompletedDocuments ? 'Complete Identity Verification' : 'Complete Onboarding Documents'}
        <ArrowRight className="w-5 h-5" />
      </DisabledFundingButton>
    </div>
  )
}