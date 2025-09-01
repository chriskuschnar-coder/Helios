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
  const dailyChange = currentValue > 0 ? 1247.18 : 0
  const dailyChangePct = currentValue > 0 ? 5.28 : 0
  const isPositive = dailyChange >= 0

  // If account has no balance, show document signing requirement
  if (currentValue === 0) {
    return (
      <div className="portfolio-value-card">
        <div className="value-header">
          <span className="label">Portfolio Status</span>
          <span className="live-indicator">
            <div className="live-dot"></div>
            READY
          </span>
        </div>
        
        <div className="value-display">
          <h1 className="current-value">$0.00</h1>
          <div className="value-change positive">
            <span>Account Created Successfully</span>
          </div>
        </div>
        
        <div className="empty-state-content">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-navy-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">
              Complete Investment Documentation
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Before funding your account, you must complete the required investment documentation 
              as mandated by SEC regulations for accredited investors.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-navy-600 font-bold">1</span>
                </div>
                <span className="text-gray-600">Sign Documents</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-400 font-bold">2</span>
                </div>
                <span className="text-gray-400">Fund Account</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-400 font-bold">3</span>
                </div>
                <span className="text-gray-400">Start Trading</span>
              </div>
            </div>
            
            <button 
              className="fund-button primary"
              onClick={() => onFundPortfolio()}
            >
              <Plus className="icon" />
              Complete Documentation
            </button>
          </div>
        </div>
      </div>
    )
  }

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
          Add Capital
        </button>
        <button className="fund-button secondary" onClick={onWithdraw}>
          <Minus className="icon" />
          Withdraw
        </button>
      </div>
      
      <div className="quick-deposit-chips">
        <span className="chip-label">Quick capital:</span>
        <button className="amount-chip" onClick={() => onFundPortfolio(1000)}>+$1K</button>
        <button className="amount-chip" onClick={() => onFundPortfolio(5000)}>+$5K</button>
        <button className="amount-chip" onClick={() => onFundPortfolio(10000)}>+$10K</button>
        <button className="amount-chip premium" onClick={() => onFundPortfolio(25000)}>+$25K</button>
      </div>
    </div>
  )
}