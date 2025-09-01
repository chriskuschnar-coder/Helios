import React, { useState } from 'react';
import { FileText, Check, X } from 'lucide-react';

interface DocumentSigningFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function DocumentSigningFlow({ onComplete, onCancel }: DocumentSigningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [signature, setSignature] = useState('');

  const documents = [
    {
      title: 'Investment Agreement',
      description: 'Terms and conditions for your investment',
      required: true
    },
    {
      title: 'Risk Disclosure',
      description: 'Important risk information',
      required: true
    },
    {
      title: 'Privacy Policy',
      description: 'How we handle your data',
      required: false
    }
  ];

  const handleSign = () => {
    if (signature.trim()) {
      if (currentStep < documents.length - 1) {
        setCurrentStep(currentStep + 1);
        setSignature('');
      } else {
        onComplete?.();
      }
    }
  };

  const currentDocument = documents[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Signing</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Step {currentStep + 1} of {documents.length}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / documents.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">{currentDocument.title}</h3>
          {currentDocument.required && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Required
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{currentDocument.description}</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 h-40 overflow-y-auto">
          <p className="text-sm text-gray-700">
            [Document content would be displayed here. This is a placeholder for the actual document text that users would review before signing.]
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature
          </label>
          <input
            type="text"
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Type your full name to sign"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={!signature.trim()}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            {currentStep < documents.length - 1 ? 'Sign & Continue' : 'Complete Signing'}
          </button>
        </div>
      </div>
    </div>
  );
}