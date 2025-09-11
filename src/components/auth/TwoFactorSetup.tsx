import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { FundingModal } from './FundingModal'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { AIInsights } from './portfolio/AIInsights'
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
import { SecuritySettings } from './SecuritySettings'

const InvestorDashboard: React.FC = () => {
  const { user, account, loading } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'markets' | 'research' | 'transactions'>('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

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
  ]

  const portfolioSections = [
    {
      id: 'allocation',
      title: 'Asset Allocation',
      icon: Target,
      component: () => <InteractiveAllocationChart currentBalance={currentBalance} />
    },
    {
        console.error('❌ TOTP verification error:', error)
      id: 'performance',
      } else {
        console.log('✅ User 2FA status updated in database')
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
      id: 'insights',
      if (err instanceof Error && err.message.includes('Invalid TOTP code')) {
        setError('Invalid code. Please check your authenticator app and try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
      }
      icon: Brain,
      component: () => <AIInsights currentBalance={currentBalance} />
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <BarChart3 className="h-8 w-8 text-navy-600" />
          </div>
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
            {/* Portfolio Value Card - Always Visible */}
            <PortfolioValueCard 
              onFundPortfolio={handleFundPortfolio}
              onWithdraw={handleWithdraw}
            />
            <PortfolioPerformanceChart currentBalance={currentBalance} />
            
            {/* Portfolio sections in expandable folders */}
            {portfolioSections.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                        <section.icon className="h-6 w-6 text-navy-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">Click to expand detailed analysis</p>
                      </div>
                    </div>
                    
                    <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedSections.has(section.id) && (
                  <div className="border-t border-gray-100 p-6">
                    <section.component />
                  </div>
                )}
              </div>
            ))}
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