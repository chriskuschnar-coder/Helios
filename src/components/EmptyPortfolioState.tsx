import React from 'react'
import { TrendingUp, Shield, Award, Users, FileText, ArrowRight } from 'lucide-react'

interface EmptyPortfolioStateProps {
  onStartOnboarding: () => void
}

export function EmptyPortfolioState({ onStartOnboarding }: EmptyPortfolioStateProps) {
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
          Welcome to Global Market Consulting's institutional investment platform. 
          Complete your onboarding documentation to begin accessing our quantitative 
          strategies and start building your investment portfolio.
        </p>
      </div>
      
      <div className="trust-indicators">
        <div className="trust-item">
          <Shield className="h-5 w-5 text-navy-600" />
          <span>SIPC Protected</span>
        </div>
        <div className="trust-item">
          <Award className="h-5 w-5 text-navy-600" />
          <span>SEC Registered</span>
        </div>
        <div className="trust-item">
          <Users className="h-5 w-5 text-navy-600" />
          <span>Institutional Grade</span>
        </div>
      </div>
      
      <button className="cta-fund-button" onClick={onStartOnboarding}>
        <FileText className="h-5 w-5" />
        Complete Onboarding Documents
        <span className="min-amount">3 Required Documents</span>
        <ArrowRight className="arrow-icon h-4 w-4" />
      </button>
      
      <div className="quick-start-amounts">
        <span className="quick-label">After onboarding, fund with:</span>
        <button className="quick-amount">$1,000</button>
        <button className="quick-amount">$5,000</button>
        <button className="quick-amount premium">$10,000</button>
      </div>
    </div>
  )
}