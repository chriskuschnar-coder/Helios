import React, { useState } from 'react'
import { TrendingUp, Plus, BarChart3, Calendar, Award, Target, Activity, RefreshCw, Eye, Users, Globe, Zap, DollarSign, Building, Shield, AlertTriangle, Clock, Brain, PieChart, TrendingDown } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { FundingModal } from './FundingModal'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { EmptyPortfolioState } from './EmptyPortfolioState'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { AIInsights } from './portfolio/AIInsights'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { LiveTradingPositions } from './portfolio/LiveTradingPositions'
import { FundNAVChart } from './portfolio/FundNAVChart'
import { PortfolioAnalytics } from './portfolio/PortfolioAnalytics'
import { RiskDashboard } from './portfolio/RiskDashboard'
import { OptimizationEngine } from './portfolio/OptimizationEngine'

export default function InvestorDashboard() {
  const { account } = useAuth()
  const [activeTab, setActiveTab] = useState<'portfolio' | 'markets' | 'research' | 'transactions'>('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const currentBalance = account?.balance || 0
  const hasActivity = currentBalance > 0

  const openFunding = (amount?: number) => {
    if (amount) {
      setSelectedAmount(amount)
    }
    setShowFundingModal(true)
  }

  const closeFunding = () => {
    setShowFundingModal(false)
    setSelectedAmount(null)
  }

  const handleWithdraw = () => {
    alert('Withdrawal functionality will be implemented here')
  }

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'markets', name: 'Markets', icon: Globe },
    { id: 'research', name: 'Research', icon: Brain },
    { id: 'transactions', name: 'Transactions', icon: Calendar }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Portfolio Value Card */}
        <PortfolioValueCard 
          onFundPortfolio={openFunding}
          onWithdraw={handleWithdraw}
        />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-navy-600 text-white'
                    : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {!hasActivity ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <EmptyPortfolioState 
                  onFundAccount={() => openFunding()}
                  onAmountSelect={(amount) => openFunding(amount)}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Performance Chart */}
                <PortfolioPerformanceChart currentBalance={currentBalance} />
                
                {/* AI Insights */}
                <AIInsights currentBalance={currentBalance} />
                
                {/* Portfolio Analytics Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <InteractiveAllocationChart currentBalance={currentBalance} />
                  <PerformanceMetrics currentBalance={currentBalance} />
                </div>
                
                {/* Trading Positions */}
                <LiveTradingPositions currentBalance={currentBalance} />
                
                {/* Fund NAV Chart */}
                <FundNAVChart />
                
                {/* Advanced Analytics */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <PortfolioAnalytics currentBalance={currentBalance} />
                  <RiskDashboard currentBalance={currentBalance} />
                </div>
                
                {/* Optimization Engine */}
                <OptimizationEngine currentBalance={currentBalance} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'markets' && <MarketsTab />}
        {activeTab === 'research' && <ResearchTab />}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Transaction History</h3>
            <p className="text-gray-600 mb-6">
              View your complete investment transaction history, deposits, withdrawals, and performance tracking.
            </p>
            <button
              onClick={() => openFunding()}
              className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Make Your First Investment
            </button>
          </div>
        )}
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={closeFunding}
        prefilledAmount={selectedAmount}
      />
    </div>
  )
}