import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { FundingModal } from './FundingModal'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { AIInsights } from './portfolio/AIInsights'
import { LiveTradingPositions } from './portfolio/LiveTradingPositions'
import { FundNAVChart } from './portfolio/FundNAVChart'
import { PortfolioAnalytics } from './portfolio/PortfolioAnalytics'
import { OptimizationEngine } from './portfolio/OptimizationEngine'
import { RiskDashboard } from './portfolio/RiskDashboard'
import { NavigationBar } from './NavigationBar'
import { TrendingUp, BarChart3, Brain, Target, Activity, Globe, FileText, DollarSign, Plus } from 'lucide-react'
import '../styles/funding.css'

export default function InvestorDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'markets' | 'research' | 'transactions'>('portfolio')

  const currentBalance = account?.balance || 0

  const openFunding = (amount: number | null = null) => {
    setPrefilledAmount(amount)
    setShowFundingModal(true)
  }

  const handleFundingSuccess = () => {
    setShowFundingModal(false)
    setPrefilledAmount(null)
    refreshAccount()
  }

  const handleProceedToPayment = (amount: number, method: string) => {
    setShowFundingModal(false)
    console.log('Proceeding to payment:', { amount, method })
  }

  const handleWithdraw = () => {
    alert('Withdrawal functionality will be implemented here')
  }

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: TrendingUp },
    { id: 'markets', name: 'Markets', icon: Globe },
    { id: 'research', name: 'Research', icon: Brain },
    { id: 'transactions', name: 'Transactions', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-gray-50 safe-area-bottom">
      <NavigationBar onFundAccount={() => openFunding()} currentPage={selectedTab} />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 md:py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 md:space-x-4 mb-4 sm:mb-6 md:mb-8 bg-white rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-sm border border-gray-100 mobile-space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 rounded-md sm:rounded-lg font-medium transition-all duration-200 mobile-button mobile-nav-tab mobile-space-x-1 ${
                selectedTab === tab.id
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="text-xs sm:text-sm md:text-base font-medium mobile-text-xs">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'portfolio' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 mobile-space-y-2">
            {/* Portfolio Value Card */}
            <PortfolioValueCard 
              onFundPortfolio={openFunding}
              onWithdraw={handleWithdraw}
            />

            {/* Performance Chart */}
            <PortfolioPerformanceChart currentBalance={currentBalance} />

            {/* AI Insights */}
            <AIInsights currentBalance={currentBalance} />

            {/* Portfolio Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mobile-grid">
              <InteractiveAllocationChart currentBalance={currentBalance} />
              <PerformanceMetrics currentBalance={currentBalance} />
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mobile-grid">
              <PortfolioAnalytics currentBalance={currentBalance} />
              <RiskDashboard currentBalance={currentBalance} />
            </div>

            {/* Trading & NAV */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mobile-grid">
              <LiveTradingPositions currentBalance={currentBalance} />
              <FundNAVChart />
            </div>

            {/* Optimization Engine */}
            <OptimizationEngine currentBalance={currentBalance} />
          </div>
        )}

        {selectedTab === 'markets' && <MarketsTab />}
        {selectedTab === 'research' && <ResearchTab />}
        {selectedTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction History</h3>
              <p className="text-gray-600 mb-6">
                View your complete investment transaction history, deposits, withdrawals, and performance tracking.
              </p>
              <button
                onClick={() => openFunding()}
                className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Make First Transaction</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        prefilledAmount={prefilledAmount}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  )
}