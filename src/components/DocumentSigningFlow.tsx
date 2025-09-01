import React, { useState } from 'react'
import { X, FileText, Check, ArrowRight } from 'lucide-react'

interface DocumentSigningFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function DocumentSigningFlow({ isOpen, onClose, onComplete }: DocumentSigningFlowProps) {
  const [signature, setSignature] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [signedDocuments, setSignedDocuments] = useState<string[]>([])

  if (!isOpen) return null

  const documents = [
    {
      id: 'investment_agreement',
      title: 'Investment Agreement',
      description: 'Terms and conditions for your investment',
      content: `GLOBAL MARKET CONSULTING FUND LP
PRIVATE PLACEMENT MEMORANDUM

CONFIDENTIAL

This Private Placement Memorandum ("PPM") contains confidential and proprietary information regarding Global Market Consulting Fund LP (the "Fund"). This document is being provided to a limited number of sophisticated investors for the sole purpose of evaluating a potential investment in the Fund.

INVESTMENT OVERVIEW

The Fund employs quantitative investment strategies designed to generate superior risk-adjusted returns through systematic exploitation of market inefficiencies. Our proprietary models process over 50,000 tick-level market events per second, utilizing advanced mathematical frameworks including:

• Volume-Synchronized Probability of Informed Trading (VPIN) analysis
• Hidden Markov Models for regime detection
• Ornstein-Uhlenbeck process calibration for statistical arbitrage
• Kyle's Lambda implementation for optimal execution

FUND TERMS

Minimum Investment: $250,000
Management Fee: 2% annually
Performance Fee: 20% of net profits
Lock-up Period: 12 months
Redemption Notice: 90 days

RISK FACTORS

Investment in the Fund involves substantial risk and is suitable only for sophisticated investors who can afford to lose their entire investment. Past performance is not indicative of future results.

By signing below, you acknowledge that you have read and understood this PPM and agree to the terms and conditions set forth herein.`
    },
    {
      id: 'risk_disclosure',
      title: 'Risk Disclosure Statement',
      description: 'Important risk information',
      content: `RISK DISCLOSURE STATEMENT

IMPORTANT: Please read this Risk Disclosure Statement carefully before investing.

GENERAL RISKS
• Loss of Capital: You may lose some or all of your investment
• Market Risk: Market conditions can adversely affect performance
• Liquidity Risk: Investments may not be easily converted to cash
• Leverage Risk: Use of leverage can amplify losses

QUANTITATIVE STRATEGY RISKS
• Model Risk: Mathematical models may fail or perform poorly
• Technology Risk: System failures could impact trading
• Data Risk: Inaccurate or delayed data could affect decisions
• Execution Risk: Trade execution may not occur as expected

REGULATORY RISKS
• Regulatory changes may impact fund operations
• Tax implications may vary based on jurisdiction
• Compliance requirements may affect strategy implementation

By signing, you acknowledge understanding these risks.`
    },
    {
      id: 'accredited_investor',
      title: 'Accredited Investor Certification',
      description: 'Investor qualification verification',
      content: `ACCREDITED INVESTOR CERTIFICATION

I hereby certify that I am an "accredited investor" as defined in Rule 501(a) of Regulation D under the Securities Act of 1933, as amended.

I meet one or more of the following criteria:
• Individual with net worth exceeding $1,000,000
• Individual with income exceeding $200,000 in each of the two most recent years
• Entity with assets exceeding $5,000,000

I understand that this investment is restricted to accredited investors only and that the securities have not been registered under the Securities Act.

By signing, I certify the accuracy of this information.`
    }
  ]

  const currentDocument = documents[currentStep - 1]
  const isLastDocument = currentStep === documents.length

  const handleSign = () => {
    if (!signature.trim()) {
      alert('Please enter your full name to sign')
      return
    }

    const documentId = currentDocument.id
    setSignedDocuments(prev => [...prev, documentId])

    if (isLastDocument) {
      // All documents signed, complete the flow
      onComplete()
    } else {
      // Move to next document
      setCurrentStep(prev => prev + 1)
      setSignature('')
    }
  }

  const handleCancel = () => {
    setCurrentStep(1)
    setSignature('')
    setSignedDocuments([])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-900">Global Market Consulting</div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <span>Portal</span>
              <span>Trading</span>
              <span>Research</span>
              <span>Support</span>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {documents.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / documents.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <span>{currentDocument.title}</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                  Required
                </span>
              </h2>
              <p className="text-gray-600">{currentDocument.description}</p>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {currentDocument.content}
              </pre>
            </div>
          </div>

          {/* Digital Signature Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h3>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Type your full name to sign"
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={handleSign}
            disabled={!signature.trim()}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>{isLastDocument ? 'Complete & Continue' : 'Sign & Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}