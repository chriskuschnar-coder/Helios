import React from 'react'
import { TrendingUp, Plus, Activity, TrendingDown } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { DisabledFundingButton } from './DisabledFundingButton'

interface PortfolioValueCardProps {
  onFundPortfolio: (amount?: number) => void
  onWithdraw: () => void
  kycStatus?: string
}

export function PortfolioValueCard({ onFundPortfolio, onWithdraw, kycStatus = 'unverified' }: PortfolioValueCardProps) {
  const { account } = useAuth()
  
  const currentValue = account?.balance || 0
  const totalDeposits = account?.total_deposits || 0
  const totalWithdrawals = account?.total_withdrawals || 0
  const netDeposits = totalDeposits - totalWithdrawals
  
  // Calculate real P&L
  const totalPnL = currentValue - netDeposits
  
  // Daily P&L (for demo, assume 1/365th of total P&L)
  const dailyChange = netDeposits > 0 ? totalPnL / 365 : 0
  const dailyChangePct = netDeposits > 0 ? (totalPnL / netDeposits * 100) / 365 : 0
  const isPositive = dailyChange >= 0
  const isKYCVerified = kycStatus === 'verified'
  const { user, profile } = useAuth()
  const hasCompletedDocuments = user?.documents_completed || profile?.documents_completed || false

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-8 mb-3 sm:mb-4 md:mb-6 mobile-card">
      <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mobile-text-xs">Total Portfolio Value</span>
        <span className="flex items-center space-x-1 sm:space-x-2 text-xs text-green-600 font-medium mobile-text-xs mobile-space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          LIVE
        </span>
      </div>
      
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-light text-gray-900 mb-1 sm:mb-2 font-mono tracking-tight mobile-portfolio-value">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium mobile-text-xs mobile-space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="opacity-80">({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mobile-space-y-1">
        <button
          onClick={() => onFundPortfolio()}
          className="flex-1 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 mobile-button active:scale-95 mobile-button-compact mobile-space-x-1 bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm mobile-text-xs">Fund Portfolio</span>
        </button>
        <DisabledFundingButton
          kycStatus={kycStatus}
          hasCompletedDocuments={hasCompletedDocuments}
          onClick={onWithdraw}
          className={`flex-1 border-2 px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 mobile-button active:scale-95 mobile-button-compact mobile-space-x-1 ${
            isKYCVerified 
              ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300' 
              : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
          }`}
        >
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm mobile-text-xs">Withdraw</span>
        </DisabledFundingButton>
      </div>
    </div>
  )
}