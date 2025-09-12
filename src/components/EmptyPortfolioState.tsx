import React from 'react'
import { TrendingUp, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface EmptyPortfolioStateProps {
  onFundAccount: () => void
  onAmountSelect: (amount: number) => void
}

export function EmptyPortfolioState({ onFundAccount, onAmountSelect }: EmptyPortfolioStateProps) {
  const { user, profile } = useAuth()

  const hasCompletedDocuments = user?.documents_completed || profile?.documents_completed || false
  const kycStatus = user?.kyc_status || 'unverified'
  const isKYCVerified = kycStatus === 'verified'

  // Determine the appropriate message and button text based on user status
  const getStatusMessage = () => {
    if (hasCompletedDocuments && isKYCVerified) {
      return {
        title: 'Add Capital to Your Account',
        description: 'Add additional capital to your existing managed account. Your onboarding and verification are complete.',
        buttonText: 'Add Account Capital'
      }
    } else if (hasCompletedDocuments) {
      return {
        title: 'Complete Identity Verification',
        description: 'Complete identity verification to unlock funding capabilities. This one-time process ensures regulatory compliance.',
        buttonText: 'Complete Identity Verification'
      }
    } else {
      return {
        title: 'Activate Your Account',
        description: 'Begin your journey with our quantitative strategies. Complete the onboarding process to access institutional-grade portfolio management.',
        buttonText: 'Complete Onboarding Documents'
      }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-24 h-24 rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200 mx-auto mb-6">
          <svg width="96" height="96" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-3">
            <path d="M20 80 L35 65 L50 50 L65 35 L80 20" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M20 20 L35 35 L50 50 L65 65 L80 80" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M70 20 L80 20 L80 30" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M70 80 L80 80 L80 70" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-4">
          {statusMessage.title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          {statusMessage.description}
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

      {/* Always enabled button to start the appropriate flow */}
      <button
        onClick={onFundAccount}
        className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg hover:scale-105 shadow-lg"
      >
        {statusMessage.buttonText}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}