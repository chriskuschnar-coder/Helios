import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { FundingModal } from './FundingModal'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { AIInsights } from './portfolio/AIInsights'
import { LiveTradingPositions } from './portfolio/LiveTradingPositions'
import { FundNAVChart } from './portfolio/FundNAVChart'
import { PortfolioAnalytics } from './portfolio/PortfolioAnalytics'
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Globe, 
  FileText, 
  Shield, 
  Target,
  Activity,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign,
  Award,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const InvestorDashboard: React.FC = () => {
  const { user, account, loading } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'markets' | 'research' | 'transactions'>('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))

  const currentBalance = account?.balance || 0
  const hasActivity = currentBalance > 0

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const handleFundPortfolio = (amount?: number) => {
    if (amount) {
      setPrefilledAmount(amount)
    }
    setShowFundingModal(true)
  }

  const handleWithdraw = () => {
    alert('Withdrawal functionality will be implemented here')
  }

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'markets', name: 'Markets', icon: Globe },
    { id: 'research', name: 'Research', icon: Brain },
    { id: 'transactions', name: 'Transactions', icon: FileText }
  ]

  const portfolioSections = [
    {
      id: 'overview',
      title: 'Portfolio Overview',
      icon: BarChart3,
      component: () => (
        <div className="space-y-6">
          <PortfolioValueCard 
            onFundPortfolio={handleFundPortfolio}
            onWithdraw={handleWithdraw}
          />
          <PortfolioPerformanceChart currentBalance={currentBalance} />
        </div>
      )
    },
    {
      id: 'allocation',
      title: 'Asset Allocation',
      icon: Target,
      component: () => <InteractiveAllocationChart currentBalance={currentBalance} />
    },
    {
      id: 'performance',
      title: 'Performance Analytics',
      icon: Award,
      component: () => <PerformanceMetrics currentBalance={currentBalance} />
    },
    {
      id: 'nav',
      title: 'Fund NAV History',
      icon: TrendingUp,
      component: () => <FundNAVChart />
    },
    {
      id: 'positions',
      title: 'Live Trading Positions',
      icon: Activity,
      component: () => <LiveTradingPositions currentBalance={currentBalance} />
    },
    {
      id: 'insights',
      title: 'AI Portfolio Insights',
      icon: Brain,
      component: () => <AIInsights currentBalance={currentBalance} />
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: BarChart3,
      component: () => <PortfolioAnalytics currentBalance={currentBalance} />
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <BarChart3 className="h-8 w-8 text-navy-600" />
          <p className="text-gray-600">Connecting to your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-medium text-sm sm:text-base transition-all duration-200 whitespace-nowrap mobile-nav-tab ${
                  selectedTab === tab.id
                    ? 'bg-navy-600 text-white'
                    : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'portfolio' && (
          <div className="space-y-6">
            {portfolioSections.map((section) => {
              const isExpanded = expandedSections.has(section.id)
              const SectionComponent = section.component
              
              return (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                          <section.icon className="h-5 w-5 text-navy-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <p className="text-sm text-gray-500">
                            {section.id === 'overview' && 'Portfolio value and performance overview'}
                            {section.id === 'allocation' && 'Asset distribution and allocation analysis'}
                            {section.id === 'performance' && 'Detailed performance metrics and analytics'}
                            {section.id === 'nav' && 'Net Asset Value history and trends'}
                            {section.id === 'positions' && 'Live trading positions from Helios'}
                            {section.id === 'insights' && 'AI-powered portfolio insights and recommendations'}
                            {section.id === 'analytics' && 'Advanced quantitative analysis'}
                            {section.id === 'risk' && 'Risk management and stress testing'}
                            {section.id === 'optimization' && 'Portfolio optimization engine'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {section.id === 'overview' && (
                          <div className="text-right hidden sm:block">
                            <div className="text-sm text-gray-500">Current Value</div>
                            <div className="text-lg font-bold text-gray-900">
                              ${currentBalance.toLocaleString()}
                            </div>
                          </div>
                        )}
                        
                        <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-gray-50">
                      <SectionComponent />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {selectedTab === 'markets' && <MarketsTab />}
        {selectedTab === 'research' && <ResearchTab />}
        {selectedTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
              <p className="text-gray-600 mb-6">
                View your complete transaction history and account activity
              </p>
              <button
                onClick={() => handleFundPortfolio()}
                className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Transaction</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => {
          setShowFundingModal(false)
          setPrefilledAmount(null)
        }}
        prefilledAmount={prefilledAmount}
      />
    </div>
  )
}

export default InvestorDashboard