import React, { useState } from 'react'
import { X, CreditCard, Building2, Smartphone, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { DiditKYCVerification } from './DiditKYCVerification'

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledAmount?: number | null
}

export function FundingModal({ isOpen, onClose, prefilledAmount }: FundingModalProps) {
  const { user } = useAuth()
  const [showKYCVerification, setShowKYCVerification] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [showFundingPage, setShowFundingPage] = useState(false)

  if (!isOpen) return null

  const handleKYCComplete = () => {
    console.log('✅ KYC verification completed, proceeding to funding')
    setShowKYCVerification(false)
    setShowCongratulations(false)
    setShowFundingPage(true)
  }

  const handleStartKYC = () => {
    setShowKYCVerification(true)
  }

  if (showKYCVerification) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-900">Identity Verification</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <DiditKYCVerification
              onVerificationComplete={handleKYCComplete}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">Fund Your Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Funds to Your Portfolio</h3>
            <p className="text-gray-600">
              Choose your preferred funding method to start investing
            </p>
          </div>

          {/* KYC Required Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Identity Verification Required</h4>
            </div>
            <p className="text-sm text-yellow-800 mb-4">
              Before you can fund your account, we need to verify your identity for compliance and security purposes.
            </p>
            <button
              onClick={handleStartKYC}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Start Identity Verification</span>
            </button>
          </div>

          {/* Funding Methods Preview (Disabled) */}
          <div className="space-y-4 opacity-50">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Bank Transfer (ACH)</h4>
                  <p className="text-sm text-gray-600">Free • 1-3 business days</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$0 fee</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Debit/Credit Card</h4>
                  <p className="text-sm text-gray-600">Instant • 2.9% + $0.30 fee</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Instant</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Cryptocurrency</h4>
                  <p className="text-sm text-gray-600">Fast • Network fees apply</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">~10 mins</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Complete identity verification to unlock all funding methods
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}