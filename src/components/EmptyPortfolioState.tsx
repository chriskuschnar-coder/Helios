import React from 'react'
import { TrendingUp, Shield, Award, ArrowRight, BarChart3 } from 'lucide-react'

interface EmptyPortfolioStateProps {
  onFundAccount: () => void
  onAmountSelect: (amount: number) => void
}

export function EmptyPortfolioState({ onFundAccount, onAmountSelect }: EmptyPortfolioStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-12 h-12 text-navy-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-4">
          Start Building Your Portfolio
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Complete your onboarding documentation to begin investing with our quantitative strategies 
          and gain access to institutional-grade portfolio management.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Shield className="w-4 h-4 text-green-600" />
          <span>SIPC Protected up to $500,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 justify-center">
          <Award className="w-4 h-4 text-green-600" />
          <span>SEC Registered Investment Advisor</span>
        </div>
      </div>

      <button
        onClick={onFundAccount}
        className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 text-lg"
      >
        Complete Onboarding Documents
        <ArrowRight className="w-5 h-5" />
      </button>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <span className="text-gray-500">Quick start:</span>
        <button
          onClick={() => onAmountSelect(10000)}
          className="text-navy-600 hover:text-navy-700 font-medium"
        >
          $10K
        </button>
        <button
          onClick={() => onAmountSelect(25000)}
          className="text-navy-600 hover:text-navy-700 font-medium"
        >
          $25K
        </button>
        <button
          onClick={() => onAmountSelect(50000)}
          className="text-navy-600 hover:text-navy-700 font-medium"
        >
          $50K
        </button>
      </div>
    </div>
  )
}