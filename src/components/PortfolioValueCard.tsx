import React, { useState } from 'react'
import { TrendingUp, Plus, ArrowDownLeft, DollarSign } from 'lucide-react'
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
  const dailyChange = 18500
  const dailyChangePct = 0.76
  const isPositive = dailyChange >= 0

  // If balance is 0 or very low, show empty state
  if (balance < 1000) {
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
        <div className={`value-change ${isPositive ? 'positive' : 'negative'}`}>
          <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString()}</span>
          <span className="percentage">({isPositive ? '+' : ''}{dailyChangePct}%)</span>
        </div>
      </div>
      
      <div className="actions-row">
        <button className="fund-button primary" onClick={() => onFundPortfolio()}>
          <Plus className="icon" />
          Add Capital
        </button>
        <button className="fund-button secondary" onClick={onWithdraw}>
          <ArrowDownLeft className="icon" />
          Withdraw
        </button>
      </div>
      
      <div className="quick-deposit-chips">
        <span className="chip-label">Quick add:</span>
        <button className="amount-chip" onClick={() => onFundPortfolio(25000)}>
          $25K
        </button>
        <button className="amount-chip" onClick={() => onFundPortfolio(50000)}>
          $50K
        </button>
        <button className="amount-chip premium" onClick={() => onFundPortfolio(100000)}>
          $100K
        </button>
      </div>
    </div>
  )
}