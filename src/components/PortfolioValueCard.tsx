import React from 'react'
import { TrendingUp, Plus, Activity, TrendingDown, ArrowUpRight, Zap, DollarSign } from 'lucide-react'
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
    <div className="portfolio-header exchange-spacing animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-blue rounded-xl flex items-center justify-center animate-blue-glow">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="exchange-label">Portfolio Value</span>
            <div className="text-xs text-white/40 mt-1">Real-time balance</div>
          </div>
        </div>
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span className="live-text">LIVE</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="portfolio-value">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <span className="text-lg font-bold">
            {isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-base opacity-80">
            ({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)
          </span>
          <span className="text-sm opacity-60">
            today
          </span>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-4">
        <button 
          onClick={() => onFundPortfolio()}
          className="flex-1 exchange-button-primary group"
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Capital</span>
            <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 exchange-button"
        >
          <div className="flex items-center justify-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Withdraw</span>
          </div>
        </button>
      </div>
    </div>
  )
}