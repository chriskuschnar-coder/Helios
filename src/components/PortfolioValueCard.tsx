import React, { useState } from 'react'
import { TrendingUp, Plus, ArrowDownLeft, DollarSign } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { DocumentSigningFlow } from './DocumentSigningFlow'

interface PortfolioValueCardProps {
  onFundPortfolio: (amount?: number) => void
  onWithdraw: () => void
}

export function PortfolioValueCard({ onFundPortfolio, onWithdraw }: PortfolioValueCardProps) {
  const { account } = useAuth()
  const [showDocumentSigning, setShowDocumentSigning] = useState(false)
  const [pendingAmount, setPendingAmount] = useState<number | undefined>(undefined)

  const balance = account?.balance || 0
  const dailyChange = 1247.18
  const dailyChangePct = 5.28
  const isPositive = dailyChange >= 0

  const handleFundPortfolio = (amount?: number) => {
    setPendingAmount(amount)
    setShowDocumentSigning(true)
  }

  const handleDocumentSigningComplete = () => {
    setShowDocumentSigning(false)
    // After documents are signed, proceed to funding
    onFundPortfolio(pendingAmount)
    setPendingAmount(undefined)
  }

  return (
    <>
      <div className="portfolio-value-card">
        <div className="value-header">
          <span className="label">Total Portfolio Value</span>
          <div className="live-indicator">
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>
        
        <div className="value-display">
          <h2 className="current-value">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className={`value-change ${isPositive ? 'positive' : 'negative'}`}>
            <span>{isPositive ? '+' : ''}${Math.abs(dailyChange).toLocaleString()}</span>
            <span className="percentage">({isPositive ? '+' : ''}{dailyChangePct}%)</span>
          </div>
        </div>
        
        <div className="actions-row">
          <button className="fund-button primary" onClick={() => handleFundPortfolio()}>
            <Plus className="icon" />
            Fund Portfolio
          </button>
          <button className="fund-button secondary" onClick={onWithdraw}>
            <ArrowDownLeft className="icon" />
            Withdraw
          </button>
        </div>
        
        <div className="quick-deposit-chips">
          <span className="chip-label">Quick deposit:</span>
          <button className="amount-chip" onClick={() => handleFundPortfolio(1000)}>
            +$1K
          </button>
          <button className="amount-chip" onClick={() => handleFundPortfolio(5000)}>
            +$5K
          </button>
          <button className="amount-chip" onClick={() => handleFundPortfolio(10000)}>
            +$10K
          </button>
          <button className="amount-chip premium" onClick={() => handleFundPortfolio(25000)}>
            +$25K
          </button>
        </div>
      </div>

      <DocumentSigningFlow
        isOpen={showDocumentSigning}
        onClose={() => setShowDocumentSigning(false)}
        onComplete={handleDocumentSigningComplete}
      />
    </>
  )
}