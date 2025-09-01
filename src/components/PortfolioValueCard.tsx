import React, { useState } from 'react'
import { TrendingUp, Plus, ArrowUpRight, DollarSign, Activity } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { EmptyPortfolioState } from './EmptyPortfolioState'
import { DocumentSigningFlow } from './DocumentSigningFlow'

interface PortfolioValueCardProps {
  onFundPortfolio: (amount?: number) => void
  onWithdraw: () => void
}

export function PortfolioValueCard({ onFundPortfolio, onWithdraw }: PortfolioValueCardProps) {
  const { account } = useAuth()
  const [showDocumentSigning, setShowDocumentSigning] = useState(false)

  const balance = account?.balance || 0
  const availableBalance = account?.available_balance || 0
  const totalDeposits = account?.total_deposits || 0

  // Show empty state if balance is 0
  if (balance === 0) {
    return (
      <>
        <EmptyPortfolioState onFundPortfolio={() => setShowDocumentSigning(true)} />
        <DocumentSigningFlow
          isOpen={showDocumentSigning}
          onClose={() => setShowDocumentSigning(false)}
          onComplete={() => {
            setShowDocumentSigning(false)
            onFundPortfolio()
          }}
        />
      </>
    )
  }

  // Calculate daily P&L (mock data for demo)
  const dailyPnL = 18500
  const dailyPnLPct = 0.76

  return (
    <div className="portfolio-value-card">
      <div className="value-header">
        <span className="label">Portfolio Value</span>
        <div className="live-indicator">
          <div className="live-dot"></div>
          LIVE
        </div>
      </div>
      
      <div className="value-display">
        <h2 className="current-value">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h2>
        <div className={`value-change ${dailyPnL >= 0 ? 'positive' : 'negative'}`}>
          <span>
            {dailyPnL >= 0 ? '+' : ''}${Math.abs(dailyPnL).toLocaleString()}
          </span>
          <span className="percentage">
            ({dailyPnLPct >= 0 ? '+' : ''}{dailyPnLPct}%)
          </span>
        </div>
      </div>

      <div className="actions-row">
        <button 
          className="fund-button primary"
          onClick={() => onFundPortfolio()}
        >
          <Plus className="icon" />
          Add Capital
        </button>
        <button 
          className="fund-button secondary"
          onClick={onWithdraw}
        >
          <ArrowUpRight className="icon" />
          Withdraw
        </button>
      </div>

      <div className="quick-deposit-chips">
        <span className="chip-label">Quick add:</span>
        <button 
          className="amount-chip"
          onClick={() => onFundPortfolio(10000)}
        >
          $10K
        </button>
        <button 
          className="amount-chip"
          onClick={() => onFundPortfolio(25000)}
        >
          $25K
        </button>
        <button 
          className="amount-chip premium"
          onClick={() => onFundPortfolio(50000)}
        >
          $50K
        </button>
      </div>
    </div>
  )
}