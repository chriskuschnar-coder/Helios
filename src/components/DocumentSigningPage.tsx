import React, { useState } from 'react'
import { FileText, CheckCircle, Download, Shield, Users, Award, ArrowRight } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface Document {
  id: string
  title: string
  description: string
  required: boolean
  signed: boolean
  url?: string
}

interface DocumentSigningPageProps {
  onDocumentsComplete: () => void
}

export function DocumentSigningPage({ onDocumentsComplete }: DocumentSigningPageProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'subscription_agreement',
      title: 'Limited Partnership Subscription Agreement',
      description: 'Primary investment agreement outlining terms, conditions, and investor rights for participation in the Global Market Consulting Fund.',
      required: true,
      signed: false,
      url: '/documents/subscription-agreement.pdf'
    },
    {
      id: 'risk_disclosure',
      title: 'Risk Disclosure Statement',
      description: 'Comprehensive disclosure of investment risks, including market volatility, leverage risks, and potential for total capital loss.',
      required: true,
      signed: false,
      url: '/documents/risk-disclosure.pdf'
    },
    {
      id: 'accredited_investor',
      title: 'Accredited Investor Certification',
      description: 'Certification of accredited investor status as required by SEC regulations for participation in private investment funds.',
      required: true,
      signed: false,
      url: '/documents/accredited-investor.pdf'
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [allSigned, setAllSigned] = useState(false)

  const handleDocumentSign = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId ? { ...doc, signed: true } : doc
      )
    )
    
    // Check if all required documents are signed
    const updatedDocs = documents.map(doc => 
      doc.id === documentId ? { ...doc, signed: true } : doc
    )
    const allRequiredSigned = updatedDocs.filter(doc => doc.required).every(doc => doc.signed)
    
    if (allRequiredSigned) {
      setAllSigned(true)
    }
  }

  const handleProceedToFunding = () => {
    if (allSigned) {
      onDocumentsComplete()
    }
  }

  const requiredDocuments = documents.filter(doc => doc.required)
  const signedCount = requiredDocuments.filter(doc => doc.signed).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-900 mb-4">
            Investment Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete the required documentation to begin your investment in the Global Market Consulting Fund.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-navy-900">Documentation Progress</h3>
            <span className="text-sm text-gray-600">{signedCount} of {requiredDocuments.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-navy-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(signedCount / requiredDocuments.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Shield className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">SEC Compliant</h4>
            <p className="text-sm text-gray-600">Fully registered investment advisor</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Users className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">Accredited Only</h4>
            <p className="text-sm text-gray-600">Qualified institutional investors</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Award className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">SIPC Protected</h4>
            <p className="text-sm text-gray-600">Investor protection coverage</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-6 mb-8">
          {documents.map((document, index) => (
            <div key={document.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      document.signed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {document.signed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900">
                        {document.title}
                      </h3>
                      {document.required && (
                        <span className="text-xs text-red-600 font-medium">REQUIRED</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 ml-11">
                    {document.description}
                  </p>
                  <div className="flex items-center space-x-4 ml-11">
                    <button className="flex items-center space-x-2 text-navy-600 hover:text-navy-700 font-medium text-sm">
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                    {!document.signed ? (
                      <button
                        onClick={() => handleDocumentSign(document.id)}
                        className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Sign Document
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium text-sm">Signed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Proceed Button */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">
            Ready to Fund Your Account?
          </h3>
          <p className="text-gray-600 mb-6">
            Once all required documents are signed, you can proceed to fund your investment account.
          </p>
          
          <button
            onClick={handleProceedToFunding}
            disabled={!allSigned}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center mx-auto ${
              allSigned
                ? 'bg-navy-600 hover:bg-navy-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Capital Funding
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          {!allSigned && (
            <p className="text-sm text-gray-500 mt-3">
              Please sign all required documents to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}