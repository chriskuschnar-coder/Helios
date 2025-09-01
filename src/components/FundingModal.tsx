import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DocumentSigningFlow } from './DocumentSigningFlow';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function FundingModal({ isOpen, onClose, onComplete }: FundingModalProps) {
  const [currentStep, setCurrentStep] = useState<'documents' | 'congratulations' | 'funding'>('documents');

  if (!isOpen) return null;

  const handleDocumentsComplete = () => {
    setCurrentStep('congratulations');
  };

  const handleProceedToFunding = () => {
    setCurrentStep('funding');
    onComplete();
  };

  const renderCongratulationsPage = () => (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-navy-900 mb-4">Onboarding Complete</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Congratulations! You have successfully completed the investor onboarding process. 
          Your documents have been reviewed and your account is now ready for funding.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
        <h3 className="font-semibold text-navy-900 mb-3">What's Next?</h3>
        <ul className="text-left text-gray-700 space-y-2">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Your investment documents are securely stored and accessible in your portal
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Fund your account to begin building your portfolio
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Access institutional-grade investment opportunities
          </li>
        </ul>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleProceedToFunding}
          className="bg-navy-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-navy-800 transition-colors flex items-center space-x-3 text-lg"
        >
          <span className="text-2xl">+</span>
          <span>Fund Your Account</span>
          <span className="text-sm opacity-75">Minimum $100</span>
          <span className="text-xl">→</span>
        </button>
        
        <div className="flex space-x-8 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            SIPC Protected
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            SEC Registered
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Institutional Grade
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-navy-900">
            {currentStep === 'documents' && 'Complete Onboarding Documents'}
            {currentStep === 'congratulations' && 'Welcome to Global Markets'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {currentStep === 'documents' && (
            <DocumentSigningFlow onComplete={handleDocumentsComplete} />
          )}
          {currentStep === 'congratulations' && renderCongratulationsPage()}
        </div>
      </div>
    </div>
  );
}