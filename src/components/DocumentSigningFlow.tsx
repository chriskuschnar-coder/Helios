import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ArrowRight, ArrowLeft, Shield, AlertCircle } from 'lucide-react';

interface DocumentSigningFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
  required: boolean;
  signed: boolean;
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'investment_agreement',
      title: 'Investment Management Agreement',
      description: 'Defines the terms of our investment management relationship and fee structure.',
      url: '/documents/Improved_Private_Placement_Memorandum.docx',
      required: true,
      signed: false
    },
    {
      id: 'risk_disclosure',
      title: 'Risk Disclosure Statement',
      description: 'Important information about investment risks and potential losses.',
      url: '/documents/Improved_Private_Placement_Memorandum copy.docx',
      required: true,
      signed: false
    },
    {
      id: 'accredited_investor',
      title: 'Accredited Investor Certification',
      description: 'Certification of your accredited investor status as required by SEC regulations.',
      url: '/documents/Improved_Private_Placement_Memorandum copy copy.docx',
      required: true,
      signed: false
    },
    {
      id: 'subscription_agreement',
      title: 'Subscription Agreement',
      description: 'Legal agreement for your investment in the Global Market Consulting Fund.',
      url: '/documents/Improved_Private_Placement_Memorandum copy copy copy.docx',
      required: true,
      signed: false
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy Acknowledgment',
      description: 'Acknowledgment of our privacy practices and data handling procedures.',
      url: '/documents/Improved_Private_Placement_Memorandum copy copy copy copy.docx',
      required: false,
      signed: false
    }
  ]);

  const [signatures, setSignatures] = useState<{ [key: string]: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const currentDocument = documents[currentStep];
  const isLastDocument = currentStep === documents.length - 1;
  const allRequiredSigned = documents.filter(d => d.required).every(d => d.signed);

  const handleSignDocument = () => {
    const signature = signatures[currentDocument.id];
    if (!signature || signature.trim().length < 2) {
      alert('Please provide your signature');
      return;
    }

    // Mark document as signed
    setDocuments(prev => prev.map(doc => 
      doc.id === currentDocument.id 
        ? { ...doc, signed: true }
        : doc
    ));

    // Move to next document or complete
    if (isLastDocument) {
      if (allRequiredSigned && agreedToTerms) {
        onComplete();
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSignatureChange = (value: string) => {
    setSignatures(prev => ({
      ...prev,
      [currentDocument.id]: value
    }));
  };

  const goToPreviousDocument = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Investment Documents</h2>
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {documents.length}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {documents.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                getStepStatus(index) === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : getStepStatus(index) === 'current'
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {getStepStatus(index) === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < documents.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  getStepStatus(index) === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-navy-600" />
            <h3 className="text-xl font-bold text-gray-900">{currentDocument.title}</h3>
            {currentDocument.required && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                Required
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">{currentDocument.description}</p>
          
          <a
            href={currentDocument.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-navy-600 hover:text-navy-700 font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Download and Review Document</span>
          </a>
        </div>

        {/* Document Preview/Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Document Summary</h4>
          <div className="text-sm text-gray-700 space-y-2">
            {currentDocument.id === 'investment_agreement' && (
              <div>
                <p><strong>Key Terms:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>2% annual management fee</li>
                  <li>20% performance fee above high water mark</li>
                  <li>Quarterly liquidity with 30-day notice</li>
                  <li>Minimum investment: $250,000</li>
                </ul>
              </div>
            )}
            {currentDocument.id === 'risk_disclosure' && (
              <div>
                <p><strong>Key Risks:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Market risk and potential for losses</li>
                  <li>Liquidity restrictions and lock-up periods</li>
                  <li>Leverage and derivatives usage</li>
                  <li>Concentration risk in specific strategies</li>
                </ul>
              </div>
            )}
            {currentDocument.id === 'accredited_investor' && (
              <div>
                <p><strong>Accredited Investor Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Individual income >$200K (or $300K joint) for 2+ years</li>
                  <li>OR net worth >$1M (excluding primary residence)</li>
                  <li>OR qualified institutional buyer</li>
                  <li>OR knowledgeable employee of fund</li>
                </ul>
              </div>
            )}
            {currentDocument.id === 'subscription_agreement' && (
              <div>
                <p><strong>Subscription Details:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Legal structure: Delaware Limited Partnership</li>
                  <li>Investment strategy: Quantitative systematic trading</li>
                  <li>Target returns: 15-25% annually</li>
                  <li>Maximum drawdown target: <10%</li>
                </ul>
              </div>
            )}
            {currentDocument.id === 'privacy_policy' && (
              <div>
                <p><strong>Privacy Highlights:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Personal information protection and encryption</li>
                  <li>Limited data sharing with service providers</li>
                  <li>Right to access and delete personal data</li>
                  <li>Compliance with GDPR and CCPA regulations</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Electronic Signature */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electronic Signature *
            </label>
            <input
              type="text"
              value={signatures[currentDocument.id] || ''}
              onChange={(e) => handleSignatureChange(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              By typing your name, you agree to electronically sign this document
            </p>
          </div>

          {/* Terms Agreement (only on last document) */}
          {isLastDocument && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms-agreement"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                />
                <label htmlFor="terms-agreement" className="text-sm text-blue-900">
                  <strong>Final Acknowledgment:</strong> I have read, understood, and agree to all the documents presented. 
                  I acknowledge that I am an accredited investor and understand the risks associated with this investment. 
                  I agree to the terms and conditions outlined in all required documents.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portfolio</span>
              </button>
              
              {currentStep > 0 && (
                <button
                  onClick={goToPreviousDocument}
                  className="flex items-center space-x-2 px-4 py-2 text-navy-600 hover:text-navy-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous Document</span>
                </button>
              )}
            </div>

            <button
              onClick={handleSignDocument}
              disabled={!signatures[currentDocument.id] || (isLastDocument && !agreedToTerms)}
              className="flex items-center space-x-2 bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>
                {isLastDocument ? 'Complete Documents' : 'Sign & Continue'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Status Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Document Completion Status</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <div key={doc.id} className={`p-3 rounded-lg border ${
              doc.signed 
                ? 'border-green-200 bg-green-50' 
                : index === currentStep
                ? 'border-navy-200 bg-navy-50'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                {doc.signed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : index === currentStep ? (
                  <FileText className="h-4 w-4 text-navy-600" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  doc.signed ? 'text-green-900' : 
                  index === currentStep ? 'text-navy-900' : 'text-gray-600'
                }`}>
                  {doc.title}
                </span>
              </div>
              <div className={`text-xs ${
                doc.signed ? 'text-green-700' : 
                index === currentStep ? 'text-navy-700' : 'text-gray-500'
              }`}>
                {doc.signed ? 'Signed' : index === currentStep ? 'Current' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>All signatures are legally binding and encrypted for security</span>
          </div>
        </div>
      </div>
    </div>
  );
}