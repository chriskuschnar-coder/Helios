import React, { useState } from 'react'
import { FileText, CheckCircle, ArrowRight, Shield, AlertCircle, PenTool } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { supabaseClient } from '../lib/supabase-client'

interface DocumentSigningFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface Document {
  id: string
  title: string
  type: string
  content: string
  signed: boolean
}

export function DocumentSigningFlow({ isOpen, onClose, onComplete }: DocumentSigningFlowProps) {
  const { user } = useAuth()
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signature, setSignature] = useState('')
  const [hasReadDocument, setHasReadDocument] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const documents: Document[] = [
    {
      id: 'ppm',
      title: 'Private Placement Memorandum (PPM)',
      type: 'investment_agreement',
      content: `PRIVATE PLACEMENT MEMORANDUM

GLOBAL MARKET CONSULTING FUND, LP
A Delaware Limited Partnership

CONFIDENTIAL

This Private Placement Memorandum ("Memorandum") relates to the offer and sale of limited partnership interests ("Interests") in Global Market Consulting Fund, LP (the "Fund"), a Delaware limited partnership.

INVESTMENT SUMMARY

The Fund employs quantitative investment strategies designed to generate superior risk-adjusted returns through systematic exploitation of market inefficiencies. The Fund's investment approach combines advanced mathematical models, including:

• Volume-Synchronized Probability of Informed Trading (VPIN) analysis
• Hidden Markov Models for regime detection
• Statistical arbitrage through cointegration analysis
• Market microstructure modeling

RISK FACTORS

Investment in the Fund involves substantial risks, including:
• Complete loss of invested capital
• Use of leverage which may amplify losses
• Limited liquidity and lock-up periods
• Concentration risk in quantitative strategies
• Model risk and potential strategy failure

MINIMUM INVESTMENT: $250,000
MANAGEMENT FEE: 2% annually
PERFORMANCE FEE: 20% of net profits
LOCK-UP PERIOD: 12 months initial, quarterly thereafter

SUITABILITY

This offering is made only to "accredited investors" as defined in Rule 501(a) of Regulation D under the Securities Act of 1933. Prospective investors must have:
• Net worth exceeding $1,000,000 (excluding primary residence), OR
• Annual income exceeding $200,000 ($300,000 joint) for the past two years

By signing below, I acknowledge that I have read and understood this Private Placement Memorandum and that I am an accredited investor as defined above.`,
      signed: false
    },
    {
      id: 'lpa',
      title: 'Limited Partnership Agreement (LPA)',
      type: 'subscription_agreement',
      content: `LIMITED PARTNERSHIP AGREEMENT

GLOBAL MARKET CONSULTING FUND, LP

ARTICLE I - FORMATION AND PURPOSE

1.1 Formation. Global Market Consulting Fund, LP (the "Partnership") is a Delaware limited partnership formed for the purpose of engaging in quantitative investment activities.

1.2 Investment Objective. The Partnership seeks to achieve superior risk-adjusted returns through systematic quantitative strategies, including but not limited to:
• Statistical arbitrage
• Market neutral strategies  
• Momentum-based algorithms
• Risk parity approaches

ARTICLE II - CAPITAL CONTRIBUTIONS

2.1 Initial Capital. Each Limited Partner shall contribute the amount specified in their Subscription Agreement, with a minimum initial contribution of $250,000.

2.2 Additional Capital. The General Partner may, but is not obligated to, call for additional capital contributions from Limited Partners.

ARTICLE III - ALLOCATIONS AND DISTRIBUTIONS

3.1 Management Fee. The Partnership shall pay the General Partner a management fee equal to 2% per annum of each Limited Partner's capital account balance.

3.2 Performance Fee. The General Partner shall receive 20% of net profits allocated to each Limited Partner's capital account, subject to a high-water mark provision.

3.3 Distribution Policy. Distributions will be made quarterly at the discretion of the General Partner.

ARTICLE IV - WITHDRAWAL AND TRANSFER

4.1 Lock-up Period. Limited Partners may not withdraw capital for 12 months following their initial investment.

4.2 Quarterly Redemptions. After the initial lock-up period, Limited Partners may redeem their interests quarterly with 90 days' written notice.

ARTICLE V - GENERAL PARTNER AUTHORITY

5.1 Management Authority. The General Partner has exclusive authority to manage the Partnership's investment activities and operations.

5.2 Investment Restrictions. The Partnership may use leverage, derivatives, and other sophisticated investment techniques as determined by the General Partner.

By signing below, I agree to be bound by all terms and conditions of this Limited Partnership Agreement.`,
      signed: false
    },
    {
      id: 'subscription',
      title: 'Subscription Agreement',
      type: 'accredited_investor',
      content: `SUBSCRIPTION AGREEMENT

GLOBAL MARKET CONSULTING FUND, LP

INVESTOR INFORMATION

By executing this Subscription Agreement, the undersigned ("Investor") hereby subscribes for limited partnership interests in Global Market Consulting Fund, LP (the "Fund").

REPRESENTATIONS AND WARRANTIES

The Investor hereby represents and warrants that:

1. ACCREDITED INVESTOR STATUS
   ☐ Individual with net worth exceeding $1,000,000 (excluding primary residence)
   ☐ Individual with annual income exceeding $200,000 ($300,000 joint filing)
   ☐ Entity with assets exceeding $5,000,000

2. INVESTMENT EXPERIENCE
   The Investor has sufficient knowledge and experience in financial matters to evaluate the merits and risks of this investment.

3. FINANCIAL CAPACITY
   The Investor can afford the complete loss of this investment without material adverse effect on their financial condition.

4. INVESTMENT INTENT
   The Investor is acquiring the interests for investment purposes only and not with a view to distribution or resale.

SUBSCRIPTION DETAILS

Investment Amount: $________________
Wire Transfer Instructions: [To be provided upon execution]
Expected Funding Date: [Within 5 business days of execution]

ACKNOWLEDGMENTS

The Investor acknowledges that:
• They have received and reviewed the Private Placement Memorandum
• They understand the risks associated with the investment
• No guarantee of profits or protection against losses has been made
• The investment is illiquid and subject to lock-up restrictions

ELECTRONIC SIGNATURE CONSENT

By providing an electronic signature below, the Investor consents to conduct this transaction electronically and agrees that their electronic signature has the same legal effect as a handwritten signature.

INVESTOR SIGNATURE

By signing below, I confirm that I have read, understood, and agree to all terms of this Subscription Agreement and the related Fund documents.`,
      signed: false
    }
  ]

  const [documentStates, setDocumentStates] = useState(documents)
  const currentDocument = documentStates[currentDocumentIndex]

  if (!isOpen) return null

  const handleSignDocument = async () => {
    if (!signature.trim()) {
      alert('Please provide your electronic signature')
      return
    }

    if (!hasReadDocument) {
      alert('Please confirm you have read the document')
      return
    }

    setIsSubmitting(true)

    try {
      // Save signed document to Supabase
      const signedDocument = {
        user_id: user?.id,
        document_id: currentDocument.id,
        document_title: currentDocument.title,
        document_type: currentDocument.type,
        signature: signature.trim(),
        signed_at: new Date().toISOString(),
        ip_address: 'client_ip', // Would be actual IP in production
        user_agent: navigator.userAgent
      }

      console.log('Saving signed document to Supabase:', signedDocument)

      const { error } = await supabaseClient
        .from('signed_documents')
        .insert(signedDocument)

      if (error) {
        console.error('Error saving signed document:', error)
        throw new Error('Failed to save document signature')
      }

      console.log('✅ Document signed and saved to Supabase')

      // Mark document as signed
      const updatedDocuments = [...documentStates]
      updatedDocuments[currentDocumentIndex].signed = true
      setDocumentStates(updatedDocuments)

      // Reset for next document
      setSignature('')
      setHasReadDocument(false)

      // Move to next document or complete
      if (currentDocumentIndex < documents.length - 1) {
        setCurrentDocumentIndex(currentDocumentIndex + 1)
      } else {
        // All documents signed - complete onboarding
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
    } catch (error) {
      console.error('Error signing document:', error)
      alert('Error signing document. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentDocumentIndex + (currentDocument.signed ? 1 : 0)) / documents.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Investment Documentation
            </h2>
            <div className="text-right">
              <div className="text-sm text-gray-600">Document {currentDocumentIndex + 1} of {documents.length}</div>
              <div className="text-sm text-gray-600">{Math.round(progress)}% Complete</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-navy-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Document Steps */}
          <div className="flex items-center space-x-4">
            {documents.map((doc, index) => (
              <div key={doc.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentDocumentIndex ? 'bg-green-600 text-white' :
                  index === currentDocumentIndex ? 'bg-navy-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentDocumentIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < documents.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentDocumentIndex ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-navy-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentDocument.title}</h3>
                <p className="text-gray-600">Please read carefully and sign to continue</p>
              </div>
            </div>

            {/* Document Text */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {currentDocument.content}
              </pre>
            </div>

            {/* Read Confirmation */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadDocument}
                  onChange={(e) => setHasReadDocument(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and understood the entire {currentDocument.title} and acknowledge 
                  all risks, terms, and conditions outlined in this document.
                </span>
              </label>
            </div>

            {/* Electronic Signature */}
            {hasReadDocument && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-3">
                  <PenTool className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Electronic Signature Required</span>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type your full legal name to sign this document electronically:
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="Enter your full legal name"
                  />
                </div>
                <div className="text-xs text-blue-700">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your electronic signature will be legally binding and equivalent to a handwritten signature.
                  Timestamp and IP address will be recorded for compliance purposes.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel Onboarding
              </button>

              <button
                onClick={handleSignDocument}
                disabled={!hasReadDocument || !signature.trim() || isSubmitting}
                className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing Document...</span>
                  </>
                ) : currentDocumentIndex < documents.length - 1 ? (
                  <>
                    <span>Sign & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Complete Onboarding</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer with compliance notice */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>
              These documents contain important legal and financial information. 
              Please consult with your financial advisor or attorney if you have questions.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}