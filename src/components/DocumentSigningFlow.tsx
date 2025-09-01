import React, { useState } from 'react'
import { FileText, CheckCircle, ArrowRight, Shield, Users, Award, Pen, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { supabaseClient } from '../lib/supabase-client'

interface Document {
  id: string
  title: string
  type: string
  content: string
  required: boolean
}

interface DocumentSigningFlowProps {
  onComplete: () => void
  onClose: () => void
}

const documents: Document[] = [
  {
    id: 'investment_agreement',
    title: 'Investment Management Agreement',
    type: 'investment_agreement',
    required: true,
    content: `INVESTMENT MANAGEMENT AGREEMENT

This Investment Management Agreement ("Agreement") is entered into between Global Market Consulting LLC ("Manager") and the undersigned investor ("Client").

INVESTMENT OBJECTIVES AND STRATEGY
The Manager will employ quantitative investment strategies including but not limited to:
• Statistical arbitrage and pairs trading
• Market microstructure analysis and VPIN modeling
• Momentum and mean reversion strategies
• Risk parity and volatility targeting

FEES AND EXPENSES
Management Fee: 2% annually of net asset value
Performance Fee: 20% of net profits above high water mark
Administrative Fee: 0.5% annually for operational expenses

RISK FACTORS
• Past performance does not guarantee future results
• Investments may lose value and principal is not guaranteed
• Strategies involve leverage which may amplify losses
• Liquidity restrictions may apply during market stress

MINIMUM INVESTMENT
Initial minimum investment: $250,000
Subsequent investments: $50,000

WITHDRAWAL TERMS
Quarterly redemption with 45-day written notice
Emergency withdrawals subject to 2% penalty fee

By signing below, Client acknowledges reading and understanding this Agreement and agrees to be bound by its terms.`
  },
  {
    id: 'risk_disclosure',
    title: 'Risk Disclosure Statement',
    type: 'risk_disclosure',
    required: true,
    content: `RISK DISCLOSURE STATEMENT

IMPORTANT: Please read this Risk Disclosure Statement carefully before investing.

INVESTMENT RISKS
Investing in hedge funds involves substantial risk of loss. You should carefully consider whether such investing is suitable for you in light of your circumstances and financial resources.

SPECIFIC RISKS INCLUDE:
• LOSS OF PRINCIPAL: You may lose some or all of your investment
• LEVERAGE RISK: Use of leverage may amplify losses significantly
• LIQUIDITY RISK: Investments may not be readily convertible to cash
• MARKET RISK: Market volatility may cause substantial losses
• OPERATIONAL RISK: Technology and operational failures may occur
• COUNTERPARTY RISK: Third parties may fail to meet obligations

QUANTITATIVE STRATEGY RISKS
• Model Risk: Mathematical models may fail or perform poorly
• Data Risk: Historical data may not predict future performance
• Technology Risk: System failures may cause trading losses
• Execution Risk: Slippage and timing may impact returns

REGULATORY CONSIDERATIONS
• This investment is suitable only for accredited investors
• Investments are not FDIC insured or guaranteed
• No regulatory body has approved this investment
• Tax implications may be complex

PERFORMANCE DISCLAIMERS
• Past performance is not indicative of future results
• Hypothetical performance results have inherent limitations
• Actual results may vary significantly from projections

By signing below, I acknowledge that I have read, understood, and accept these risks.`
  },
  {
    id: 'accredited_investor',
    title: 'Accredited Investor Certification',
    type: 'accredited_investor',
    required: true,
    content: `ACCREDITED INVESTOR CERTIFICATION

I hereby certify that I am an "accredited investor" as defined in Rule 501(a) of Regulation D under the Securities Act of 1933, as amended.

QUALIFICATION CRITERIA (Check all that apply):

INCOME TEST:
☐ Individual income exceeding $200,000 in each of the two most recent years
☐ Joint income with spouse exceeding $300,000 in each of the two most recent years
☐ Reasonable expectation of reaching the same income level in the current year

NET WORTH TEST:
☐ Individual or joint net worth exceeding $1,000,000 (excluding primary residence)

PROFESSIONAL CERTIFICATIONS:
☐ Hold Series 7, 65, or 82 license in good standing
☐ Knowledgeable employee of private fund

ENTITY QUALIFICATIONS:
☐ Entity with assets exceeding $5,000,000
☐ Entity owned entirely by accredited investors

INVESTMENT EXPERIENCE
I have sufficient knowledge and experience in financial and business matters to evaluate the merits and risks of this investment.

FINANCIAL SOPHISTICATION
I am able to bear the economic risk of this investment, including complete loss of my investment.

REPRESENTATIONS AND WARRANTIES
• I have adequate means of providing for my current needs and contingencies
• I have no need for liquidity from this investment
• I can afford a complete loss of this investment
• I am not relying on this investment for retirement or other essential needs

ACKNOWLEDGMENT
I understand that this certification is material to the Manager's determination of my eligibility to invest and that the Manager will rely on this certification.

By signing below, I certify under penalty of perjury that the foregoing is true and correct.`
  }
]

export function DocumentSigningFlow({ onComplete, onClose }: DocumentSigningFlowProps) {
  const { user } = useAuth()
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signedDocuments, setSignedDocuments] = useState<Set<string>>(new Set())
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const currentDocument = documents[currentDocumentIndex]
  const isLastDocument = currentDocumentIndex === documents.length - 1
  const allDocumentsSigned = signedDocuments.size === documents.length

  const handleSignDocument = async () => {
    if (!signature.trim()) {
      setError('Please enter your full legal name as your electronic signature')
      return
    }

    if (!user) {
      setError('User not authenticated')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Save signed document to Supabase
      const { error: dbError } = await supabaseClient
        .from('signed_documents')
        .insert({
          user_id: user.id,
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          document_type: currentDocument.type,
          signature: signature.trim(),
          signed_at: new Date().toISOString(),
          ip_address: 'WebContainer', // In production, get real IP
          user_agent: navigator.userAgent
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save document signature')
      }

      console.log('✅ Document signed and saved:', currentDocument.title)

      // Mark document as signed
      setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
      setSignature('')

      // Move to next document or complete
      if (isLastDocument) {
        // All documents signed, show completion
        setTimeout(() => {
          onComplete()
        }, 1000)
      } else {
        setCurrentDocumentIndex(prev => prev + 1)
      }

    } catch (err) {
      console.error('Document signing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign document')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(prev => prev - 1)
      setSignature('')
      setError('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold text-navy-900">
            Investment Documentation
          </h2>
          <div className="text-sm text-gray-600">
            Document {currentDocumentIndex + 1} of {documents.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-navy-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentDocumentIndex + 1) / documents.length) * 100}%` }}
          />
        </div>

        {/* Document Status Indicators */}
        <div className="flex items-center space-x-4">
          {documents.map((doc, index) => (
            <div key={doc.id} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                signedDocuments.has(doc.id) 
                  ? 'bg-green-100 text-green-800' 
                  : index === currentDocumentIndex
                    ? 'bg-navy-100 text-navy-800'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {signedDocuments.has(doc.id) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-sm font-medium ${
                signedDocuments.has(doc.id) 
                  ? 'text-green-700' 
                  : index === currentDocumentIndex
                    ? 'text-navy-700'
                    : 'text-gray-500'
              }`}>
                {doc.title.split(' ')[0]} {doc.title.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-navy-600" />
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900">
                {currentDocument.title}
              </h3>
              <p className="text-sm text-gray-600">
                Please review this document carefully before signing
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {currentDocument.content}
            </pre>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Pen className="h-5 w-5 text-navy-600" />
          <h4 className="font-medium text-navy-900">Electronic Signature</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Legal Name (Electronic Signature)
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="Type your full legal name"
              required
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Electronic Signature Agreement</p>
                <p>
                  By typing your name above, you agree that this constitutes your legal electronic signature 
                  and has the same legal effect as a handwritten signature.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentDocumentIndex > 0 && (
            <button
              onClick={handlePreviousDocument}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Previous Document
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel Onboarding
          </button>
        </div>

        <button
          onClick={handleSignDocument}
          disabled={!signature.trim() || isSubmitting}
          className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing Document...</span>
            </>
          ) : isLastDocument ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Complete Onboarding</span>
            </>
          ) : (
            <>
              <Pen className="h-5 w-5" />
              <span>Sign & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-navy-600" />
          <span>SEC Registered</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-navy-600" />
          <span>SIPC Protected</span>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-navy-600" />
          <span>Institutional Grade</span>
        </div>
      </div>
    </div>
  )
}

export default DocumentSigningFlow