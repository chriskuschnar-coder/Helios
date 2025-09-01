import React from 'react'
import { TrendingUp, Shield, Users, ArrowRight } from 'lucide-react'

interface EmptyPortfolioStateProps {
  onFundPortfolio: () => void
  onStartOnboarding: () => void
}

export function EmptyPortfolioState({ onFundPortfolio, onStartOnboarding }: EmptyPortfolioStateProps) {
  return (
    <div className="empty-portfolio-state">
      <div className="illustration">
        <div className="chart-illustration">
          <TrendingUp className="h-16 w-16 text-navy-600" />
          <div className="chart-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
          </div>
        </div>
      </div>
      
      <div className="content">
        <h2>Start Building Your Portfolio</h2>
        <p>
          Welcome to Global Market Consulting's quantitative investment platform. 
          Fund your account to begin accessing our institutional-grade 
          trading strategies and portfolio management tools.
        </p>
      </div>
      
      <div className="trust-indicators">
        <div className="trust-item">
          <Shield className="h-4 w-4 text-green-600" />
          <span>SEC Compliant</span>
        </div>
        <div className="trust-item">
          <Users className="h-4 w-4 text-blue-600" />
          <span>Accredited Investors</span>
        </div>
        <div className="trust-item">
          <TrendingUp className="h-4 w-4 text-gold-600" />
          <span>Institutional Grade</span>
        </div>
      </div>
      
      <button 
        className="cta-onboarding-button" 
        onClick={onStartOnboarding}
      >
        Start Growing Your Portfolio
        <ArrowRight className="arrow-icon" />
      </button>
      
      <button className="cta-fund-button" onClick={onFundPortfolio}>
        Fund Portfolio
        <span className="min-amount">$250K minimum</span>
        <ArrowRight className="arrow-icon" />
      </button>
    </div>
  )
}