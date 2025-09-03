import React from 'react'
import { TrendingUp, Plus, Minus, Activity, TrendingDown } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface PortfolioValueCardProps {
  onFundPortfolio: (amount?: number) => void
  onWithdraw: () => void
}

export function PortfolioValueCard({ onFundPortfolio, onWithdraw }: PortfolioValueCardProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-8 mb-4 md:mb-6 mobile-card">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <span className="text-xs md:text-sm uppercase tracking-wider text-gray-500 font-semibold">Total Portfolio Value</span>
        <span className="flex items-center space-x-2 text-xs text-green-600 font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          LIVE
        </span>
      </div>
      
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-light text-gray-900 mb-2 font-mono tracking-tight">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center space-x-2 text-sm md:text-base font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="opacity-80">({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <button 
          onClick={() => onFundPortfolio()}
          className="flex-1 bg-black hover:bg-gray-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mobile-button active:scale-95"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-sm md:text-base">Fund Portfolio</span>
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mobile-button active:scale-95"
        >
          <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-sm md:text-base">Withdraw</span>
        </button>
      </div>
    </div>
  )
}