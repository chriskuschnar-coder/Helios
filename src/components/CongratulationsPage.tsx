import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Crown, Sparkles, ArrowRight, DollarSign, Trophy, Star, Zap, Shield } from 'lucide-react';

interface CongratulationsPageProps {
  onContinueToPayment: () => void;
}

export function CongratulationsPage({ onContinueToPayment }: CongratulationsPageProps) {
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Staggered animations for maximum impact
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowStats(true), 1200);
    setTimeout(() => setShowButton(true), 2000);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DollarSign className="absolute top-20 left-20 h-8 w-8 text-green-500 opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }} />
        <TrendingUp className="absolute top-32 right-32 h-6 w-6 text-blue-500 opacity-40 animate-bounce" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-40 left-40 h-7 w-7 text-yellow-500 opacity-35 animate-bounce" style={{ animationDelay: '1.5s' }} />
        <Crown className="absolute top-40 left-1/2 h-8 w-8 text-purple-500 opacity-30 animate-bounce" style={{ animationDelay: '2s' }} />
        <Trophy className="absolute bottom-32 right-20 h-6 w-6 text-orange-500 opacity-40 animate-bounce" style={{ animationDelay: '2.5s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl w-full text-center">
          {/* Main Congratulations Section */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </div>

            <h1 className="font-serif text-5xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
              🎉 Congratulations! 🎉
            </h1>
            
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Welcome to Global Markets Consulting
            </h2>
            
            <p className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              You've just joined an <span className="font-bold text-emerald-600">exclusive community</span> of sophisticated investors 
              accessing <span className="font-bold text-blue-600">revolutionary quantitative strategies</span> that have delivered 
              <span className="font-bold text-purple-600">extraordinary returns</span>.
            </p>
          </div>

          {/* Achievement Stats */}
          <div className={`transition-all duration-1000 transform ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="font-serif text-4xl font-bold text-emerald-600 mb-2">287%</div>
                <div className="text-gray-700 font-semibold">Average Annual Return</div>
                <div className="text-sm text-gray-600 mt-1">Across all institutional accounts</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="font-serif text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-700 font-semibold">Account Blow-ups</div>
                <div className="text-sm text-gray-600 mt-1">Perfect risk management record</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="font-serif text-4xl font-bold text-purple-600 mb-2">3.12</div>
                <div className="text-gray-700 font-semibold">Sharpe Ratio</div>
                <div className="text-sm text-gray-600 mt-1">Exceptional risk-adjusted returns</div>
              </div>
            </div>

            {/* Exclusive Benefits */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/50 mb-12">
              <h3 className="font-serif text-3xl font-bold text-gray-800 mb-8">
                🌟 Your Exclusive Investment Benefits 🌟
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-green-800">AI-Powered Trading</div>
                      <div className="text-sm text-green-700">50,000+ events processed per second</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-blue-800">Elite Performance</div>
                      <div className="text-sm text-blue-700">Top 1% of hedge fund returns</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-purple-800">VIP Access</div>
                      <div className="text-sm text-purple-700">Exclusive investor portal & reports</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-yellow-800">Wealth Generation</div>
                      <div className="text-sm text-yellow-700">Systematic alpha generation</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-emerald-800">Risk Protection</div>
                      <div className="text-sm text-emerald-700">Advanced risk management systems</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-indigo-800">Premium Service</div>
                      <div className="text-sm text-indigo-700">Dedicated relationship management</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl p-8 text-white mb-8 shadow-2xl">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-4">
                🚀 You're About to Join the Financial Elite! 🚀
              </h3>
              <p className="text-lg lg:text-xl opacity-95 max-w-2xl mx-auto">
                Your documents are complete! One final step to activate your account and start 
                generating <span className="font-bold">extraordinary returns</span> with our 
                <span className="font-bold"> AI-powered quantitative strategies</span>.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <button
              onClick={onContinueToPayment}
              className="group relative bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <DollarSign className="h-7 w-7" />
                <span>Complete Your Investment</span>
                <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              
              {/* Sparkle Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="absolute top-2 right-4 h-4 w-4 text-yellow-300 animate-ping" />
                <Sparkles className="absolute bottom-3 left-6 h-3 w-3 text-pink-300 animate-ping" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute top-4 left-1/3 h-3 w-3 text-blue-300 animate-ping" style={{ animationDelay: '1s' }} />
              </div>
            </button>
            
            <p className="text-gray-600 mt-4 text-lg">
              🔒 Secure payment processing • 💎 Instant account activation • 🚀 Start earning immediately
            </p>
          </div>

          {/* Testimonial/Social Proof */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} mt-12`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <blockquote className="text-lg italic text-gray-700 mb-4">
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}