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
    <div className="portfolio-header holographic-card animate-liquid luxury-spacing">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-gradient rounded-full flex items-center justify-center animate-neural-pulse">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="ai-label">Portfolio Value</span>
            <div className="text-xs text-white/40 mt-1">Real-time balance</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse"></div>
          <span className="text-xs text-cyan-400 font-medium tracking-wider">LIVE</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="ai-portfolio-value">
          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`ai-change-indicator ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <span className="text-lg font-bold">
            {isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-base opacity-80">
            ({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)
          </span>
          <span className="text-sm opacity-60 ai-thinking">
            <span className="ai-thinking-dots">
              <span className="ai-thinking-dot"></span>
              <span className="ai-thinking-dot"></span>
              <span className="ai-thinking-dot"></span>
            </span>
            today
          </span>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row gap-4">
        <button 
          onClick={() => onFundPortfolio()}
          className="flex-1 neural-button-primary interactive-element group"
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5 group-hover:rotate-90 cinematic-transition" />
            <span>Add Capital</span>
            <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 cinematic-transition" />
          </div>
        </button>
        <button 
          onClick={onWithdraw}
          className="flex-1 glass-button interactive-element"
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