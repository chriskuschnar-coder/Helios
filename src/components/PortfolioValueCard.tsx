import React from 'react'
import { TrendingUp, Plus, Activity, TrendingDown, ArrowUpRight, Zap } from 'lucide-react'
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
    <div className="portfolio-header fintech-card animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-gradient rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Portfolio Value</span>
            <div className="text-xs text-gray-400 mt-1">Real-time balance</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">LIVE</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="portfolio-value animate-count-up">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`portfolio-change ${isPositive ? 'positive' : 'negative'} mt-3`}>
          {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <span className="text-lg font-bold">
            {isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-base opacity-80">
            ({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)
          </span>
          <span className="text-sm opacity-60">today</span>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-4">
        <button 
          onClick={() => onFundPortfolio()}
          className="flex-1 premium-button interactive-element group"
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Capital</span>
            <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 glass-button interactive-element"
          style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Withdraw</span>
          </div>
        </button>
      </div>
      
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-light text-gray-900 mb-1 sm:mb-2 font-mono tracking-tight mobile-portfolio-value">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base font-medium mobile-text-xs mobile-space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="opacity-80">({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 mobile-space-y-1">
        <button 
          onClick={() => onFundPortfolio()}
          className="flex-1 bg-black hover:bg-gray-800 text-white px-3 sm:px-4 md:px-6 py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 mobile-button active:scale-95 mobile-button-compact mobile-space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm md:text-base mobile-text-xs">Fund Portfolio</span>
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-3 sm:px-4 md:px-6 py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 mobile-button active:scale-95 mobile-button-compact mobile-space-x-1"
        >
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs sm:text-sm md:text-base mobile-text-xs">Withdraw</span>
        </button>
      </div>
    </div>
  )
}