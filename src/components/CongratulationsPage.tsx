import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

interface CongratulationsPageProps {
  onContinueToPayment: () => void;
}

export function CongratulationsPage({ onContinueToPayment }: CongratulationsPageProps) {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowButton(true), 800);
  }, []);

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Main Success Icon */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
              Congratulations!
            </h1>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6">
              Welcome to Global Markets Consulting
            </h2>
          </div>

          {/* Success Message */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4">
                Your Documents Are Complete!
              </h3>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                You're now ready to activate your account and complete your investment.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <button
              onClick={onContinueToPayment}
              className="group bg-black hover:bg-gray-800 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6" />
                <span>Complete Your Investment</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}