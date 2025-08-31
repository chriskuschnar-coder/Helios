import React from 'react'
import { TrendingUp, Plus, Minus, Activity } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface PortfolioValueCardProps {
  onFundPortfolio: (amount?: number) => void
  onWithdraw: () => void
}

export function PortfolioValueCard({ onFundPortfolio, onWithdraw }: PortfolioValueCardProps) {
  const { account } = useAuth()
  
  const currentValue = account?.balance || 0
  const dailyChange = 1247.18
  const dailyChangePct = 5.28
  const isPositive = dailyChange >= 0

  return (
    <div className="portfolio-value-card">
      <div className="value-header">
        <span className="label">Total Portfolio Value</span>
        <span className="live-indicator">
          <div className="live-dot"></div>
          LIVE
        </span>
      </div>
      
      <div className="value-display">
        <h1 className="current-value">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
        <div className={`value-change ${isPositive ? 'positive' : 'negative'}`}>
          <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="percentage">({isPositive ? '+' : ''}{dailyChangePct.toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="actions-row">
        <button className="fund-button primary" onClick={() => onFundPortfolio()}>
          <Plus className="icon" />
          Fund Portfolio
        </button>
        <button className="fund-button secondary" onClick={onWithdraw}>
          <Minus className="icon" />
          Withdraw
        </button>
      </div>
      
      <div className="quick-deposit-chips">
        <span className="chip-label">Quick deposit:</span>
        <button className="amount-chip" onClick={() => onFundPortfolio(1000)}>+$1K</button>
        <button className="amount-chip" onClick={() => onFundPortfolio(5000)}>+$5K</button>
        <button className="amount-chip" onClick={() => onFundPortfolio(10000)}>+$10K</button>
        <button className="amount-chip premium" onClick={() => onFundPortfolio(25000)}>+$25K</button>
      </div>
    </div>
  )
}