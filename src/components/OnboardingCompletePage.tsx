import React from 'react'
import { CheckCircle, Award, Shield, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react'

interface OnboardingCompletePageProps {
  onFundAccount: () => void
}

export function OnboardingCompletePage({ onFundAccount }: OnboardingCompletePageProps) {
  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto">
          <div className="w-full h-full border-4 border-green-200 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>

      {/* Congratulations Message */}
      <h1 className="font-serif text-3xl font-bold text-navy-900 mb-4">
        Onboarding Complete!
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Congratulations! You have successfully completed the investment onboarding process 
        for Global Market Consulting. All required documentation has been executed and 
        your investor account is now fully activated.
      </p>

      {/* Completion Details */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h3 className="font-medium text-green-900 mb-4">Documents Successfully Executed:</h3>
        <div className="space-y-2 text-sm text-green-800">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Investment Management Agreement</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Risk Disclosure Statement</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Accredited Investor Certification</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-navy-50 rounded-xl p-6 mb-8">
        <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">
          Ready to Begin Investing
        </h3>
        <p className="text-navy-700 mb-6">
          Your account is now ready for capital deployment. Fund your account to begin 
          accessing our quantitative investment strategies and institutional-grade execution.
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Shield className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-navy-900">SIPC Protected</div>
            <div className="text-xs text-navy-600">Up to $500,000</div>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-navy-900">Institutional Grade</div>
            <div className="text-xs text-navy-600">Professional Management</div>
          </div>
          <div className="text-center">
            <Award className="h-8 w-8 text-navy-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-navy-900">SEC Registered</div>
            <div className="text-xs text-navy-600">Regulatory Compliance</div>
          </div>
        </div>
      </div>

      {/* Fund Account CTA */}
      <div className="space-y-4">
        <button
          onClick={onFundAccount}
          className="w-full bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-6 w-6" />
          <span>Fund Your Account</span>
          <ArrowRight className="h-5 w-5" />
        </button>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <span>Minimum: $250,000</span>
          <span>•</span>
          <span>Instant Processing</span>
          <span>•</span>
          <span>Secure Transfer</span>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>What's Next:</strong> Once you fund your account, you'll gain access to real-time 
          portfolio tracking, quantitative performance analytics, and our institutional research platform.
        </p>
      </div>
    </div>
  )
}