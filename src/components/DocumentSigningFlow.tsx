import React, { useState } from 'react'
import { X, FileText, Check } from 'lucide-react'

interface DocumentSigningFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function DocumentSigningFlow({ isOpen, onClose, onComplete }: DocumentSigningFlowProps) {
  const [signature, setSignature] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  
  if (!isOpen) return null

  const handleSign = () => {
    if (signature.trim()) {
      // Move to next step or complete
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
        setSignature('')
      } else {
        onComplete()
      }
    }
  }

  const documents = [
    {
      title: 'Investment Agreement',
      description: 'Terms and conditions for your investment',
      content: `PRIVATE PLACEMENT MEMORANDUM

GLOBAL MARKETS CONSULTING FUND I, LLC

This Private Placement Memorandum ("PPM") contains important information about Global Markets Consulting Fund I, LLC (the "Fund"). This document is confidential and proprietary and is being provided to you solely for your consideration of a potential investment in the Fund.

INVESTMENT OVERVIEW
The Fund seeks to generate superior risk-adjusted returns through quantitative trading strategies across global financial markets. Our proprietary algorithms analyze market inefficiencies and execute trades with institutional precision.

MINIMUM INVESTMENT
The minimum initial investment is $250,000 for accredited investors.

RISK FACTORS
Investment in the Fund involves substantial risk and is suitable only for sophisticated investors who can afford the loss of their entire investment.

FEES AND EXPENSES
Management Fee: 2% annually
Performance Fee: 20% of net profits

By signing below, you acknowledge that you have read and understood this PPM and agree to the terms and conditions outlined herein.`
    },
    {
      title: 'Risk Disclosure',
      description: 'Important risk information',
      content: 'Risk disclosure content...'
    },
    {
      title: 'Accredited Investor Verification',
      description: 'Verification of investor status',
      content: 'Accredited investor verification content...'
    }
  ]

  const currentDoc = documents[currentStep - 1]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-navy-900">Global Markets Consulting</div>
            <div className="text-sm text-gray-500">Investment Portal</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentDoc.title}</h2>
              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                Required
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{currentDoc.description}</p>

          {/* Document Content Area */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-64 overflow-y-auto">
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {currentDoc.content}
            </div>
          </div>

          {/* Digital Signature Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Digital Signature</h3>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name to sign"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={handleSign}
            disabled={!signature.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Sign & Continue</span>
          </button>
        </div>
      </div>
    </div>
  )
}