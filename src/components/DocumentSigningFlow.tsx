import React, { useState } from 'react';
import { FileText, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface DocumentSigningFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function DocumentSigningFlow({ onComplete, onBack }: DocumentSigningFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signedDocuments, setSignedDocuments] = useState<Set<number>>(new Set());
  const [signatures, setSignatures] = useState<{ [key: number]: string }>({});

  const documents = [
    {
      id: 1,
      title: 'Investment Agreement',
      description: 'Terms and conditions for your investment',
      required: true
    },
    {
      id: 2,
      title: 'Risk Disclosure',
      description: 'Important risk information and disclosures',
      required: true
    },
    {
      id: 3,
      title: 'Accredited Investor Verification',
      description: 'Verification of accredited investor status',
      required: true
    }
  ];

  const currentDocument = documents[currentStep - 1];

  const handleSignature = (signature: string) => {
    setSignatures(prev => ({
      ...prev,
      [currentDocument.id]: signature
    }));
    setSignedDocuments(prev => new Set([...prev, currentDocument.id]));
  };

  const handleNext = () => {
    if (currentStep < documents.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isCurrentDocumentSigned = signedDocuments.has(currentDocument.id);
  const allDocumentsSigned = documents.every(doc => signedDocuments.has(doc.id));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {documents.length}
          </span>
          <span className="text-sm text-gray-500">
            {signedDocuments.size} of {documents.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Document Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            {currentDocument.title}
            {currentDocument.required && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Required
              </span>
            )}
          </h3>
          <p className="text-gray-600">{currentDocument.description}</p>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-gray-50 rounded-lg p-8 mb-8 min-h-[400px]">
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            [Document content would be displayed here. This is a placeholder for the actual document 
            text that users would review before signing.]
          </p>
          
          {/* Sample document content based on type */}
          {currentDocument.id === 1 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Investment Agreement Terms:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Minimum investment amount: $250,000</li>
                <li>Management fee: 2% annually</li>
                <li>Performance fee: 20% of profits</li>
                <li>Lock-up period: 12 months</li>
                <li>Redemption notice: 90 days</li>
              </ul>
            </div>
          )}
          
          {currentDocument.id === 2 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Risk Disclosures:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Past performance does not guarantee future results</li>
                <li>Investment involves substantial risk of loss</li>
                <li>Hedge fund strategies may use leverage and derivatives</li>
                <li>Limited liquidity and redemption restrictions apply</li>
                <li>Suitable for sophisticated investors only</li>
              </ul>
            </div>
          )}
          
          {currentDocument.id === 3 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Accredited Investor Requirements:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Individual net worth exceeding $1 million</li>
                <li>Annual income exceeding $200,000 (or $300,000 joint)</li>
                <li>Qualified institutional buyer status</li>
                <li>Investment advisor with $100M+ assets under management</li>
                <li>Other SEC-defined accredited investor categories</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Digital Signature Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Digital Signature</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type your full name to sign
            </label>
            <input
              type="text"
              value={signatures[currentDocument.id] || ''}
              onChange={(e) => handleSignature(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your full name to sign"
            />
          </div>
          
          {isCurrentDocumentSigned && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Document signed successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {currentStep === 1 ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={!isCurrentDocumentSigned}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {currentStep === documents.length ? (
            allDocumentsSigned ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Sign & Continue
              </>
            ) : (
              'Complete All Documents'
            )
          ) : (
            <>
              Sign & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}