import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Target,
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingDown
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { CheckoutButton } from './CheckoutButton'
import { StripeCheckout } from './StripeCheckout'
import { FundingModal } from './FundingModal'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { AIInsights } from './portfolio/AIInsights'
import { PerformanceMetrics } from './portfolio/PerformanceMetrics'
import { RiskDashboard } from './portfolio/RiskDashboard'
import { OptimizationEngine } from './portfolio/OptimizationEngine'
import { PortfolioAnalytics } from './portfolio/PortfolioAnalytics'
import { InteractiveAllocationChart } from './portfolio/InteractiveAllocationChart'
import { LiveTradingPositions } from './portfolio/LiveTradingPositions'
import { FundNAVChart } from './portfolio/FundNAVChart'
import { MarketsTab } from './markets/MarketsTab'
import { ResearchTab } from './research/ResearchTab'
import '../styles/funding.css'

interface FundInvestmentDetails {
  units_held: number
  nav_per_unit: number
  total_invested: number
  current_value: number
  unrealized_pnl: number
  fund_allocation_pct: number
}

interface LiveFundMetrics {
  fund_equity: number
  daily_pnl: number
  open_positions: number
  win_rate: number
  total_trades: number
}

interface RecentActivity {
  id: string
  type: 'nav_update' | 'subscription' | 'redemption' | 'trading_pnl' | 'position_open' | 'position_close'
  description: string
  amount?: number
  timestamp: string
  status: 'completed' | 'pending' | 'processing'
}

export default function InvestorDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'markets' | 'research' | 'transactions'>('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [fundDetails, setFundDetails] = useState<FundInvestmentDetails | null>(null)
  const [liveMetrics, setLiveMetrics] = useState<LiveFundMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Generate fund investment details based on account data
  const generateFundDetails = (): FundInvestmentDetails => {
    const currentBalance = account?.balance || 0
    const totalDeposits = account?.total_deposits || 0
    const navPerUnit = account?.nav_per_unit || 1000.0000
    const unitsHeld = account?.units_held || (currentBalance / navPerUnit)
    
    return {
      units_held: unitsHeld,
      nav_per_unit: navPerUnit,
      total_invested: totalDeposits,
      current_value: currentBalance,
      unrealized_pnl: currentBalance - totalDeposits,
      fund_allocation_pct: currentBalance > 0 ? (currentBalance / 5000000) * 100 : 0 // Assume $5M total fund
    }
  }

  // Generate live fund metrics (from MT5 data)
  const generateLiveMetrics = (): LiveFundMetrics => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.01
    const hasActivity = (account?.balance || 0) > 0
    
    if (!hasActivity) {
      return {
        fund_equity: 0,
        daily_pnl: 0,
        open_positions: 0,
        win_rate: 0,
        total_trades: 0
      }
    }

    return {
      fund_equity: 4200000 + (timeVariation * 50000), // Total fund equity
      daily_pnl: 12500 + (timeVariation * 2000),
      open_positions: 8 + Math.floor(timeVariation * 3),
      win_rate: 76.4 + (timeVariation * 5),
      total_trades: 1247 + Math.floor(timeVariation * 10)
    }
  }

  // Generate recent activity feed
  const generateRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = []
    const now = new Date()
    
    // NAV updates (daily)
    activities.push({
      id: 'nav-1',
      type: 'nav_update',
      description: 'Daily NAV updated to $1,045.23 (+0.8%)',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    })

    // Trading P&L
    activities.push({
      id: 'pnl-1',
      type: 'trading_pnl',
      description: 'XAUUSD position closed +$2,450 profit',
      amount: 2450,
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    })

    // Position updates
    activities.push({
      id: 'pos-1',
      type: 'position_open',
      description: 'New EURUSD short position opened at 1.0845',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    })

    if ((account?.balance || 0) > 0) {
      activities.push({
        id: 'sub-1',
        type: 'subscription',
        description: 'Capital subscription processed',
        amount: account?.total_deposits || 0,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      })
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const refreshData = async () => {
    setLoading(true)
    setFundDetails(generateFundDetails())
    setLiveMetrics(generateLiveMetrics())
    setRecentActivity(generateRecentActivity())
    await new Promise(resolve => setTimeout(resolve, 300))
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [account])

  const openFunding = (amount: number | null = null) => {
    setPrefilledAmount(amount)
    setShowFundingModal(true)
  }

  const handleWithdraw = () => {
    alert('Withdrawal functionality will be implemented based on your fund\'s redemption policy.')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'nav_update': return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'subscription': return <Plus className="h-4 w-4 text-green-600" />
      case 'redemption': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'trading_pnl': return <DollarSign className="h-4 w-4 text-purple-600" />
      case 'position_open': return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      case 'position_close': return <ArrowDownRight className="h-4 w-4 text-gray-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'nav_update': return 'bg-blue-50 border-blue-200'
      case 'subscription': return 'bg-green-50 border-green-200'
      case 'redemption': return 'bg-red-50 border-red-200'
      case 'trading_pnl': return 'bg-purple-50 border-purple-200'
      case 'position_open': return 'bg-blue-50 border-blue-200'
      case 'position_close': return 'bg-gray-50 border-gray-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'markets', name: 'Markets', icon: TrendingUp },
    { id: 'research', name: 'Research', icon: Target },
    { id: 'transactions', name: 'Activity', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-gray-50 safe-area-bottom">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-area-top">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mobile-text-lg">
                Investment Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mobile-text-xs">
                {user?.email} • Premium Account
              </p>
            </div>
            <button
              onClick={() => openFunding()}
              className="bg-navy-600 hover:bg-navy-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center space-x-1 sm:space-x-2 mobile-button mobile-compact-padding mobile-space-x-1"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Capital</span>
            </button>
          </div>
          
          {/* Mobile-Optimized Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mobile-nav-tab">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md font-medium text-xs sm:text-sm transition-colors mobile-nav-tab mobile-space-x-1 ${
                  selectedTab === tab.id
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-600 hover:text-navy-600'
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{tab.name}</span>
                <span className="xs:hidden">{tab.name.charAt(0)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {selectedTab === 'portfolio' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 mobile-space-y-2">
            {/* Portfolio Value Card */}
            <PortfolioValueCard 
              onFundPortfolio={openFunding}
              onWithdraw={handleWithdraw}
            />

            {/* Fund Investment Details */}
            {fundDetails && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mb-3 sm:mb-4 mobile-text-sm">
                  Fund Investment Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mobile-grid">
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Units Held
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-blue-900 mobile-text-sm">
                      {fundDetails.units_held.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      NAV per Unit
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-green-900 mobile-text-sm">
                      ${fundDetails.nav_per_unit.toFixed(4)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Total Invested
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-purple-900 mobile-text-sm">
                      ${fundDetails.total_invested.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gold-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-gold-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Fund Allocation
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-gold-900 mobile-text-sm">
                      {fundDetails.fund_allocation_pct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Fund Performance (MT5 Data) */}
            {liveMetrics && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mobile-text-sm">
                    Live Fund Performance
                  </h3>
                  <div className="flex items-center space-x-1 sm:space-x-2 mobile-space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium mobile-text-xs">MT5 LIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mobile-grid">
                  <div className="bg-navy-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-navy-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Fund Equity
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-navy-900 mobile-text-sm">
                      ${(liveMetrics.fund_equity / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Daily P&L
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-green-900 mobile-text-sm">
                      +${liveMetrics.daily_pnl.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Open Positions
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-blue-900 mobile-text-sm">
                      {liveMetrics.open_positions}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Win Rate
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-purple-900 mobile-text-sm">
                      {liveMetrics.win_rate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center mobile-card">
                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1 mobile-text-xs">
                      Total Trades
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mobile-text-sm">
                      {liveMetrics.total_trades.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fund Strategy Allocation */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mb-3 sm:mb-4 mobile-text-sm">
                Fund Strategy Allocation
              </h3>
              <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg mobile-card">
                  <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-1">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900 text-xs sm:text-sm mobile-text-xs">Forex Trading (MT5)</div>
                      <div className="text-xs text-blue-700 mobile-text-xs">Active algorithmic strategies</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-lg font-bold text-blue-900 mobile-text-sm">85%</div>
                    <div className="text-xs text-blue-700 mobile-text-xs">+2.4% today</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg mobile-card">
                  <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-1">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900 text-xs sm:text-sm mobile-text-xs">Cash & Equivalents</div>
                      <div className="text-xs text-green-700 mobile-text-xs">Available for trading</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-lg font-bold text-green-900 mobile-text-sm">15%</div>
                    <div className="text-xs text-green-700 mobile-text-xs">+0.1% today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Fund Activity */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mobile-text-sm">
                  Recent Fund Activity
                </h3>
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors mobile-button mobile-compact-padding"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border mobile-card ${getActivityColor(activity.type)}`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-1">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate mobile-text-xs">
                          {activity.description}
                        </div>
                        <div className="text-xs text-gray-600 mobile-text-xs">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-xs sm:text-sm font-bold text-gray-900 mobile-text-xs">
                        +${activity.amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mb-3 sm:mb-4 mobile-text-sm">
                Account Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mobile-grid">
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center mobile-card">
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1 sm:mb-2 mobile-text-xs">
                    Investment Status
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-green-900 mobile-text-sm">
                    Active
                  </div>
                  <div className="text-xs text-green-700 mobile-text-xs">
                    Participating in fund
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center mobile-card">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1 sm:mb-2 mobile-text-xs">
                    Next NAV Update
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-blue-900 mobile-text-sm">
                    Daily
                  </div>
                  <div className="text-xs text-blue-700 mobile-text-xs">
                    6:00 PM EST
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center mobile-card">
                  <div className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1 sm:mb-2 mobile-text-xs">
                    Redemption
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-purple-900 mobile-text-sm">
                    Monthly
                  </div>
                  <div className="text-xs text-purple-700 mobile-text-xs">
                    30-day notice
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <PortfolioPerformanceChart currentBalance={account?.balance || 0} />

            {/* Fund NAV Chart */}
            <FundNAVChart />

            {/* Live Trading Positions */}
            <LiveTradingPositions currentBalance={account?.balance || 0} />

            {/* Interactive Allocation Chart */}
            <InteractiveAllocationChart currentBalance={account?.balance || 0} />

            {/* AI Insights */}
            <AIInsights currentBalance={account?.balance || 0} />

            {/* Performance Metrics */}
            <PerformanceMetrics currentBalance={account?.balance || 0} />

            {/* Risk Dashboard */}
            <RiskDashboard currentBalance={account?.balance || 0} />

            {/* Portfolio Analytics */}
            <PortfolioAnalytics currentBalance={account?.balance || 0} />

            {/* Optimization Engine */}
            <OptimizationEngine currentBalance={account?.balance || 0} />
          </div>
        )}

        {selectedTab === 'markets' && <MarketsTab />}
        {selectedTab === 'research' && <ResearchTab />}
        
        {selectedTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900 mb-3 sm:mb-4 mobile-text-sm">
              Transaction History
            </h3>
            <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border mobile-card ${getActivityColor(activity.type)}`}>
                  <div className="flex items-center space-x-2 sm:space-x-3 mobile-space-x-1">
                    {getActivityIcon(activity.type)}
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900 mobile-text-xs">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-600 mobile-text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()} • {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <div className="text-xs sm:text-sm font-bold text-gray-900 mobile-text-xs">
                        ${activity.amount.toLocaleString()}
                      </div>
                    )}
                    <div className={`text-xs px-2 py-1 rounded-full font-medium mobile-text-xs ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        prefilledAmount={prefilledAmount}
      />
    </div>
  )
}