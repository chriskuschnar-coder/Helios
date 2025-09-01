import React, { useState } from 'react'
import { FileText, CheckCircle, ArrowRight, Shield, Award, Users, Pen } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { supabaseClient } from '../lib/supabase-client'

interface Document {
  id: string
  title: string
  description: string
  content: string
  required: boolean
}

interface DocumentSigningFlowProps {
  onComplete: () => void
  onBack: () => void
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const { user } = useAuth()
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signedDocuments, setSignedDocuments] = useState<Set<string>>(new Set())
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)

  // Placeholder documents - you'll replace these with your actual documents
  const documents: Document[] = [
    {
      id: 'investment_agreement',
      title: 'Investment Management Agreement',
      description: 'Primary agreement governing the investment relationship and fund management terms',
      content: 'This document will contain your Investment Management Agreement content...',
      required: true
    },
    {
      id: 'risk_disclosure',
      title: 'Risk Disclosure Statement',
      description: 'Comprehensive disclosure of investment risks and potential losses',
      content: 'This document will contain your Risk Disclosure Statement content...',
      required: true
    },
    {
      id: 'accredited_investor',
      title: 'Accredited Investor Certification',
      description: 'Certification of accredited investor status as required by SEC regulations',
      content: 'This document will contain your Accredited Investor Certification content...',
      required: true
    }
  ]

  const currentDocument = documents[currentDocumentIndex]
  const isLastDocument = currentDocumentIndex === documents.length - 1
  const allDocumentsSigned = documents.every(doc => signedDocuments.has(doc.id))

  const handleSignDocument = async () => {
    if (!signature.trim()) {
      alert('Please enter your full legal name to sign the document')
      return
    }

    setIsSubmitting(true)

    try {
      // Save signed document to Supabase
      const { error } = await supabaseClient
        .from('signed_documents')
        .insert({
          user_id: user?.id,
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          document_type: currentDocument.id,
          signature: signature,
          signed_at: new Date().toISOString(),
          ip_address: 'client_ip', // You could get real IP if needed
          user_agent: navigator.userAgent
        })

      if (error) {
        console.error('Error saving document:', error)
        throw new Error('Failed to save signed document')
      }

      // Mark document as signed
      setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
      setSignature('')

      if (isLastDocument) {
        // All documents signed, show congratulations
        setShowCongratulations(true)
      } else {
        // Move to next document
        setCurrentDocumentIndex(prev => prev + 1)
      }

    } catch (error) {
      console.error('Document signing error:', error)
      alert('Failed to sign document. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(prev => prev - 1)
    }
  }

  const handleNextDocument = () => {
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(prev => prev + 1)
    }
  }

  if (showCongratulations) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="font-serif text-3xl font-bold text-navy-900 mb-4">
          Onboarding Complete
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Congratulations! You have successfully completed the investor onboarding process. 
          All required documentation has been executed and your account is now ready for capital deployment.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-navy-600" />
            </div>
            <div className="text-sm text-gray-600">SIPC Protected</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-navy-600" />
            </div>
            <div className="text-sm text-gray-600">SEC Registered</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-navy-600" />
            </div>
            <div className="text-sm text-gray-600">Institutional Grade</div>
          </div>
        </div>

        <div className="bg-navy-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-medium text-navy-900 mb-3">Next Steps</h3>
          <ul className="text-sm text-navy-700 space-y-2 text-left">
            <li>• Fund your account to begin trading</li>
            <li>• Access quantitative strategies</li>
            <li>• Monitor real-time performance</li>
            <li>• Receive monthly investor reports</li>
          </ul>
        </div>

        <button
          onClick={onComplete}
          className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center mx-auto text-lg"
        >
          Fund Your Account
          <span className="ml-2 text-sm opacity-80">Minimum $100</span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold text-navy-900">
            Investor Onboarding
          </h2>
          <span className="text-sm text-gray-600">
            Document {currentDocumentIndex + 1} of {documents.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-navy-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentDocumentIndex + 1) / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Document Display */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-navy-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900">
                {currentDocument.title}
              </h3>
              <p className="text-gray-600">{currentDocument.description}</p>
            </div>
          </div>
          
          {signedDocuments.has(currentDocument.id) && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Document Signed</span>
            </div>
          )}
        </div>

        {/* Document Content Area */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            <div className="text-center text-gray-500 py-20">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h4 className="font-medium text-gray-700 mb-2">{currentDocument.title}</h4>
              <p className="text-sm text-gray-600">
                Document content will be loaded here
              </p>
              <div className="mt-4 text-xs text-gray-500">
                Ready for your document upload
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        {!signedDocuments.has(currentDocument.id) && (
          <div className="p-6 border-t border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Electronic Signature
              </label>
              <div className="relative">
                <Pen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full legal name to sign"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                By typing your name, you agree to electronically sign this document
              </p>
            </div>

            <button
              onClick={handleSignDocument}
              disabled={!signature.trim() || isSubmitting}
              className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing Document...
                </>
              ) : (
                <>
                  <Pen className="h-4 w-4 mr-2" />
                  Sign Document
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>
          
          {currentDocumentIndex > 0 && (
            <button
              onClick={handlePreviousDocument}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Previous Document
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          {!isLastDocument && signedDocuments.has(currentDocument.id) && (
            <button
              onClick={handleNextDocument}
              className="px-6 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg font-medium flex items-center"
            >
              Next Document
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Document Status Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Document Status</h4>
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div key={doc.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{doc.title}</span>
              <div className="flex items-center space-x-2">
                {signedDocuments.has(doc.id) ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Signed</span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                    <span className="text-sm text-gray-500">Pending</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}