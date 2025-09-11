import React, { useState } from 'react'
import { FileText, CheckCircle, Download, Eye, Shield, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface DocumentSigningFlowProps {
  onComplete: () => void
  onBack: () => void
}

interface Document {
  id: string
  title: string
  description: string
  required: boolean
  signed: boolean
  url: string
  type: 'investment_agreement' | 'risk_disclosure' | 'accredited_investor' | 'subscription_agreement' | 'privacy_policy'
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const { user, markDocumentsCompleted } = useAuth()
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [signedDocuments, setSignedDocuments] = useState<Set<string>>(new Set())
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check if user has already completed documents
  const hasCompletedDocuments = user?.documents_completed

  const documents: Document[] = [
    {
      id: 'private_placement_memorandum',
      title: 'Confidential Private Placement Memorandum',
      description: 'Comprehensive investment overview, strategy details, and fund structure information.',
      required: false,
      signed: false,
      url: '/documents/Global_Markets_PPM_Final_85pp_TOC (2) copy copy.pdf',
      type: 'investment_agreement'
    },
    {
      id: 'investment_agreement',
      title: 'Investment Management Agreement',
      description: 'Defines the terms of our investment management relationship and fee structure.',
      required: true,
      signed: false,
      url: '/documents/Improved_Private_Placement_Memorandum.docx',
      type: 'investment_agreement'
    },
    {
      id: 'risk_disclosure',
      title: 'Risk Disclosure Statement',
      description: 'Important information about investment risks and potential losses.',
      required: true,
      signed: false,
      url: '/documents/Improved_Private_Placement_Memorandum copy.docx',
      type: 'risk_disclosure'
    },
    {
      id: 'accredited_investor',
      title: 'Accredited Investor Certification',
      description: 'Certification of your accredited investor status as required by SEC regulations.',
      required: true,
      signed: false,
      url: '/documents/Improved_Private_Placement_Memorandum copy copy.docx',
      type: 'accredited_investor'
    },
    {
      id: 'subscription_agreement',
      title: 'Subscription Agreement',
      description: 'Legal agreement for your investment subscription in our fund.',
      required: true,
      signed: false,
      url: '/documents/Improved_Private_Placement_Memorandum copy copy copy.docx',
      type: 'subscription_agreement'
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy Agreement',
      description: 'Our privacy policy and data protection practices.',
      required: true,
      signed: false,
      url: '/documents/Improved_Private_Placement_Memorandum copy copy copy copy.docx',
      type: 'privacy_policy'
    }
  ]

  // If user has already completed documents, show completion message
  if (hasCompletedDocuments) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          Documents Already Completed!
        </h3>
        <p className="text-gray-600 mb-6">
          You have already completed all required onboarding documents. 
          You can proceed directly to funding your account.
        </p>
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3"
        >
          Continue to Funding
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const currentDocument = documents[currentDocumentIndex]
  const allRequiredSigned = documents.filter(doc => doc.required).every(doc => signedDocuments.has(doc.id))
  const isCurrentDocumentRequired = currentDocument.required

  const handleSignDocument = async () => {
    if (!signature.trim()) {
      setError('Please enter your full legal name as your signature')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Store signed document in database
      const { supabaseClient } = await import('../lib/supabase-client')
      const { error: signError } = await supabaseClient
        .from('signed_documents')
        .insert({
          user_id: user?.id,
          document_id: currentDocument.id,
          document_title: currentDocument.title,
          document_type: currentDocument.type,
          signature: signature.trim(),
          signed_at: new Date().toISOString(),
          ip_address: 'unknown', // In production, you'd capture the real IP
          user_agent: navigator.userAgent
        })

      if (signError) {
        throw new Error('Failed to save signature')
      }

      // Mark document as signed
      setSignedDocuments(prev => new Set([...prev, currentDocument.id]))
      setSignature('')

      // Move to next document or complete
      if (currentDocumentIndex < documents.length - 1) {
        setCurrentDocumentIndex(prev => prev + 1)
      } else {
        // All documents signed - mark as completed
        await markDocumentsCompleted()
        onComplete()
      }
    } catch (err) {
      setError('Failed to save signature. Please try again.')
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

  const handleNextDocument = () => {
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(prev => prev + 1)
      setSignature('')
      setError('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Document {currentDocumentIndex + 1} of {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentDocumentIndex + 1) / documents.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-navy-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentDocumentIndex + 1) / documents.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Document Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {currentDocument.required ? (
              <FileText className="h-6 w-6 text-navy-600" />
            ) : (
              <Eye className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentDocument.title}</h3>
            {!currentDocument.required && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Eye className="h-3 w-3 mr-1" />
                  Review Only - No Signature Required
                </span>
              </div>
            )}
            <p className="text-gray-600 mb-4">{currentDocument.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={currentDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>Review Document</span>
              </a>
              <a
                href={currentDocument.url}
                download
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
          
          {signedDocuments.has(currentDocument.id) && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Section or Review Section */}
      {isCurrentDocumentRequired ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Electronic Signature</h4>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Legal Electronic Signature</span>
            </div>
            <p className="text-sm text-blue-700">
              By typing your full legal name below, you are providing a legally binding electronic signature 
              equivalent to a handwritten signature under the Electronic Signatures in Global and National Commerce Act.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
              Full Legal Name (Electronic Signature)
            </label>
            <input
              type="text"
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors"
              placeholder="Type your full legal name"
              disabled={signedDocuments.has(currentDocument.id)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This constitutes your legal electronic signature
            </p>
          </div>

          {/* Navigation and Sign Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portfolio</span>
              </button>
              
              {currentDocumentIndex > 0 && (
                <button
                  onClick={handlePreviousDocument}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {!signedDocuments.has(currentDocument.id) && isCurrentDocumentRequired ? (
                <button
                  onClick={handleSignDocument}
                  disabled={!signature.trim() || isSubmitting}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Sign Document</span>
                    </>
                  )}
                </button>
              ) : isCurrentDocumentRequired ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Document Signed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Review Complete</span>
                </div>
              )}

              {(!isCurrentDocumentRequired || signedDocuments.has(currentDocument.id)) && currentDocumentIndex < documents.length - 1 && (
                <button
                  onClick={handleNextDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Next Document</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {allRequiredSigned && currentDocumentIndex === documents.length - 1 && (
                <button
                  onClick={async () => {
                    await markDocumentsCompleted()
                    onComplete()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Onboarding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="text-center">
            <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Document Review</h4>
            <p className="text-blue-700 mb-6">
              Please review the Private Placement Memorandum above. This document provides important 
              information about the investment opportunity and does not require your signature.
            </p>
            
            <div className="flex justify-center gap-3">
              {currentDocumentIndex > 0 && (
                <button
                  onClick={handlePreviousDocument}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
              
              {currentDocumentIndex < documents.length - 1 ? (
                <button
                  onClick={handleNextDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Continue to Signature Documents</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await markDocumentsCompleted()
                    onComplete()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Onboarding</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document List Overview */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Checklist</h4>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div 
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index === currentDocumentIndex ? 'border-navy-500 bg-navy-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  signedDocuments.has(doc.id) ? 'bg-green-100' : 
                  index === currentDocumentIndex ? 'bg-navy-100' : 'bg-gray-100'
                }`}>
                  {signedDocuments.has(doc.id) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : !doc.required ? (
                    <Eye className="h-4 w-4 text-blue-600" />
                  ) : (
                    <span className={`font-bold text-sm ${
                      index === currentDocumentIndex ? 'text-navy-600' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${
                    index === currentDocumentIndex ? 'text-navy-900' : 'text-gray-900'
                  }`}>
                    {doc.title}
                  </div>
                  <div className="text-sm text-gray-600">{doc.description}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {signedDocuments.has(doc.id) && (
                  <span className="text-sm font-medium text-green-600">Signed</span>
                )}
                {!doc.required && (
                  <span className="text-sm font-medium text-blue-600">Review Only</span>
                )}
                {index === currentDocumentIndex && (
                  <span className="text-sm font-medium text-navy-600">Current</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}