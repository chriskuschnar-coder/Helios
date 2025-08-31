import React from 'react'
import { TrendingUp, ArrowRight, Shield, Users, Award, Plus } from 'lucide-react'

interface EmptyPortfolioStateProps {
  onFundAccount: () => void
}

export function EmptyPortfolioState({ onFundAccount }: EmptyPortfolioStateProps) {
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
          Fund your account to begin trading and investing with our 
          quantitative strategies and institutional-grade execution.
        </p>
        
        <div className="trust-indicators">
          <div className="trust-item">
            <Shield className="h-5 w-5 text-navy-600" />
            <span>SIPC Protected</span>
          </div>
          <div className="trust-item">
            <Users className="h-5 w-5 text-navy-600" />
            <span>Institutional Grade</span>
          </div>
          <div className="trust-item">
            <Award className="h-5 w-5 text-navy-600" />
            <span>SEC Registered</span>
          </div>
        </div>
        
        <button className="cta-fund-button" onClick={onFundAccount}>
          <Plus className="h-5 w-5" />
          Fund Your Account
          <span className="min-amount">Minimum $100</span>
          <ArrowRight className="arrow-icon" />
        </button>
        
        <div className="quick-start-amounts">
          <span className="quick-label">Popular amounts:</span>
          <button onClick={() => onFundAccount()} className="quick-amount">$1,000</button>
          <button onClick={() => onFundAccount()} className="quick-amount">$5,000</button>
          <button onClick={() => onFundAccount()} className="quick-amount premium">$10,000</button>
        </div>
      </div>
    </div>
  )
}