import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, ArrowRight, DollarSign, Trophy, Star, Shield } from 'lucide-react';

interface CongratulationsPageProps {
  onContinueToPayment: () => void;
}

export function CongratulationsPage({ onContinueToPayment }: CongratulationsPageProps) {
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Staggered animations for smooth reveal
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowStats(true), 800);
    setTimeout(() => setShowButton(true), 1200);
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-200 rounded-full opacity-15"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full opacity-10"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DollarSign className="absolute top-32 left-32 h-6 w-6 text-green-400 opacity-40" />
        <TrendingUp className="absolute top-40 right-40 h-5 w-5 text-blue-400 opacity-50" />
        <Star className="absolute bottom-40 left-1/3 h-5 w-5 text-yellow-400 opacity-45" />
        <Trophy className="absolute bottom-32 right-32 h-6 w-6 text-orange-400 opacity-40" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl w-full text-center">
          {/* Main Success Icon */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
              Congratulations!
            </h1>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6">
              Welcome to Global Markets Consulting
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              You've just joined an <span className="font-semibold text-green-600">exclusive community</span> of sophisticated investors 
              accessing <span className="font-semibold text-blue-600">revolutionary quantitative strategies</span> that have delivered 
              <span className="font-semibold text-purple-600">extraordinary returns</span>.
            </p>
          </div>

          {/* Performance Stats */}
          <div className={`transition-all duration-1000 transform ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">287%</div>
                <div className="text-gray-700 font-medium">Average Annual Return</div>
                <div className="text-sm text-gray-500 mt-1">Across all institutional accounts</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Account Blow-ups</div>
                <div className="text-sm text-gray-500 mt-1">Perfect risk management record</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">3.12</div>
                <div className="text-gray-700 font-medium">Sharpe Ratio</div>
                <div className="text-sm text-gray-500 mt-1">Exceptional risk-adjusted returns</div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                🎉 Your Documents Are Complete! 🎉
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You're now ready to activate your account and start generating 
                <span className="font-semibold text-green-600"> exceptional returns</span> with our 
                <span className="font-semibold text-blue-600"> AI-powered quantitative strategies</span>.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <button
              onClick={onContinueToPayment}
              className="group bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6" />
                <span>Complete Your Investment</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
            
            <p className="text-gray-600 mt-4 text-lg">
              🔒 Secure payment processing • 💎 Instant account activation • 🚀 Start earning immediately
            </p>
          </div>

          {/* Testimonial */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} mt-12`}>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-1 mb-3">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
              <blockquote className="text-lg italic text-gray-700 mb-3">
                "In just 18 months, my investment with Global Markets Consulting has grown by 342%. 
                Their quantitative approach is simply unmatched in the industry."
              </blockquote>
              <cite className="font-semibold text-gray-800">
                — Dr. Sarah Chen, Former Goldman Sachs Managing Director
              </cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}