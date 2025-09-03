import React, { useState } from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Activity,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { CheckoutButton } from './CheckoutButton'
import { PortfolioValueCard } from './PortfolioValueCard'
import { FundingModal } from './FundingModal'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { NavigationBar } from './NavigationBar'
import { StripeCheckout } from './StripeCheckout'
import { SubscriptionStatus } from './SubscriptionStatus'
import { MarketsTab } from './markets/MarketsTab'
import '../styles/funding.css'

export function InvestorDashboard() {
  const { user, account, subscription, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedTopTab, setSelectedTopTab] = useState('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  // Extract first name from user data
  const getFirstName = () => {
    if (user?.full_name) {
      return user.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  // Calculate real P&L based on account data
  const calculatePortfolioData = () => {
    const currentBalance = account?.balance || 0
    const totalDeposits = account?.total_deposits || 0
    const totalWithdrawals = account?.total_withdrawals || 0
    
    // Net deposits (what user actually put in)
    const netDeposits = totalDeposits - totalWithdrawals
    
    // Total P&L is current balance minus net deposits
    const totalPnL = currentBalance - netDeposits
    
    // If no deposits yet, everything should be zero
    if (netDeposits === 0) {
      return {
        totalValue: 0,
        monthlyReturn: 0,
        yearlyReturn: 0,
        totalReturn: 0,
        dailyPnL: 0,
        dailyPnLPct: 0
      }
    }
    
    // Calculate percentages based on net deposits
    const totalReturnPct = (totalPnL / netDeposits) * 100
    
    // For demo purposes, assume daily P&L is 1/365th of total return
    const dailyPnL = totalPnL / 365
    const dailyPnLPct = totalReturnPct / 365
    
    // YTD return (assume account opened this year)
    const ytdReturn = totalReturnPct
    
    return {
      totalValue: currentBalance,
      monthlyReturn: totalReturnPct / 12, // Monthly average
      yearlyReturn: ytdReturn,
      totalReturn: totalReturnPct,
      dailyPnL: dailyPnL,
      dailyPnLPct: dailyPnLPct
    }
  }

  const portfolioData = calculatePortfolioData()

  // Check if account has real trading activity (not just deposits)
  const hasRealTradingActivity = false // This will be true once we implement real trading data
  
  const holdings = hasRealTradingActivity ? [
    { name: 'Alpha Fund', allocation: 65, value: (account?.balance || 0) * 0.65, return: 14.2, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 25, value: (account?.balance || 0) * 0.25, return: 8.7, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 10, value: (account?.balance || 0) * 0.10, return: 18.9, risk: 'High' }
  ] : [
    { name: 'Alpha Fund', allocation: 0, value: 0, return: 0, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 0, value: 0, return: 0, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 0, value: 0, return: 0, risk: 'High' }
  ]

  // Get real transactions from database - for now show empty until real trading activity
  const recentTransactions: any[] = []
  
  // TODO: When implementing real trading, fetch from database:
  // const { data: transactions } = await supabaseClient
  //   .from('transactions')
  //   .select('*')
  //   .eq('user_id', user?.id)
  //   .order('created_at', { ascending: false })
  //   .limit(10)

  const documents = [
    { name: 'Monthly Performance Report - January 2025', date: '2025-01-31', type: 'Performance' },
    { name: 'Quarterly Investment Letter - Q4 2024', date: '2025-01-15', type: 'Letter' },
    { name: 'Annual Tax Statement - 2024', date: '2025-01-10', type: 'Tax' },
    { name: 'Risk Disclosure Statement', date: '2024-12-01', type: 'Legal' },
    { name: 'Investment Agreement Amendment', date: '2024-11-15', type: 'Legal' },
    { name: 'Compliance Documentation', date: '2024-10-01', type: 'Compliance' }
  ]

  const tabs = [
    { id: 'overview', name: 'Portfolio Overview', icon: BarChart3 },
    { id: 'holdings', name: 'Holdings Detail', icon: PieChart },
    { id: 'transactions', name: 'Transaction History', icon: Activity },
    { id: 'documents', name: 'Documents', icon: FileText }
  ]

  const topTabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'markets', name: 'Markets', icon: TrendingUp },
    { id: 'research', name: 'Research', icon: FileText },
    { id: 'transactions', name: 'Transactions', icon: Activity },
    { id: 'invest', name: 'Invest', icon: CreditCard }
  ]

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

  // Pull-to-refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.5, 80))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true)
      await refreshAccount()
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
    }
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 safe-area-bottom"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center transition-all duration-300"
          style={{ 
            height: `${pullDistance}px`,
            opacity: pullDistance / 80 
          }}
        >
          <div className={`text-gray-600 text-sm font-medium ${isRefreshing ? 'animate-spin' : ''}`}>
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5" />
            ) : pullDistance > 60 ? (
              'Release to refresh'
            ) : (
              'Pull to refresh'
            )}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Top Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-4 md:mb-8 mobile-card">
          <div className="px-3 md:px-6 py-3 md:py-4">
            {/* Mobile: Horizontal scroll tabs */}
            <nav className="flex space-x-2 md:space-x-8 overflow-x-auto scrollbar-hide">
              {topTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTopTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-3 md:px-4 rounded-lg font-medium text-sm transition-colors mobile-tab whitespace-nowrap ${
                    selectedTopTab === tab.id
                      ? 'bg-navy-600 text-white'
                      : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Investment Tab Content */}
        {selectedTopTab === 'invest' && (
          <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
            <StripeCheckout className="h-fit" />
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mobile-card">
              <h3 className="font-serif text-lg md:text-xl font-bold text-navy-900 mb-4">Investment Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm md:text-base text-gray-700">Secure payment processing via Stripe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm md:text-base text-gray-700">Instant account funding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm md:text-base text-gray-700">Professional investment management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm md:text-base text-gray-700">Real-time portfolio tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Value Card */}
        {selectedTopTab === 'portfolio' && (
          <div className="mb-4 md:mb-6 mobile-card">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mb-1 mobile-text-lg">
              Welcome back, {getFirstName()}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mobile-text-sm">
              Here's your portfolio performance and investment overview
            </p>
          </div>
        )}

        {selectedTopTab === 'portfolio' && (
          <PortfolioValueCard 
            onFundPortfolio={openFunding}
            onWithdraw={() => console.log('Withdraw clicked')}
          />
        )}

        {/* Performance Summary Cards */}
        {selectedTopTab === 'portfolio' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-4 md:mb-8 mobile-grid">
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium mobile-text-xs">Daily P&L</span>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-green-600 mb-1 mobile-text-lg">
                +${portfolioData.dailyPnL.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-green-600 mobile-text-xs">+{portfolioData.dailyPnLPct}%</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium mobile-text-xs">YTD Return</span>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-green-600 mb-1 mobile-text-lg">
                +{portfolioData.yearlyReturn}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mobile-text-xs">Outperforming benchmark</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 mobile-card">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium mobile-text-xs">Available Cash</span>
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mb-1 mobile-text-lg">
                ${account?.available_balance?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Performance Chart */}
        {selectedTopTab === 'portfolio' && (
          <PortfolioPerformanceChart 
            currentBalance={account?.balance || 0}
            className="mb-4 md:mb-8"
          />
        )}

        {/* Markets Tab Content */}
        {selectedTopTab === 'markets' && (
          <div className="space-y-3 sm:space-y-4 md:space-y-8 mobile-space-y-2">
            <MarketsTab />
          </div>
        )}

        {/* Research Tab Content */}
        {selectedTopTab === 'research' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-8 mb-4 md:mb-8 mobile-card">
            <div className="text-center">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-navy-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mb-3 sm:mb-4 mobile-text-lg">Quantitative Research</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 mobile-text-sm">
                Access our latest research reports, market analysis, and quantitative insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mobile-grid">
                <div className="bg-navy-50 rounded-lg p-3 sm:p-4 md:p-6 text-left mobile-card">
                  <h4 className="font-medium text-navy-900 mb-1 sm:mb-2 text-sm sm:text-base mobile-text-sm">Latest Research Report</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 mobile-text-xs">Q1 2025 Market Outlook: Quantitative Signals Analysis</p>
                  <button className="text-navy-600 hover:text-navy-700 font-medium text-xs sm:text-sm mobile-button mobile-text-xs">
                    Download PDF →
                  </button>
                </div>
                <div className="bg-navy-50 rounded-lg p-3 sm:p-4 md:p-6 text-left mobile-card">
                  <h4 className="font-medium text-navy-900 mb-1 sm:mb-2 text-sm sm:text-base mobile-text-sm">Strategy Performance</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 mobile-text-xs">Monthly attribution analysis and factor decomposition</p>
                  <button className="text-navy-600 hover:text-navy-700 font-medium text-xs sm:text-sm mobile-button mobile-text-xs">
                    View Analysis →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab Content */}
        {selectedTopTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-4 md:p-8 mb-4 md:mb-8 mobile-card">
            <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy-900 mb-4 sm:mb-6 mobile-text-lg">Transaction History</h3>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mobile-button mobile-compact-padding">
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mobile-text-xs">{transaction.type}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{transaction.fund} • {transaction.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs sm:text-sm md:text-base font-medium mobile-text-xs ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{transaction.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-2 text-sm sm:text-base mobile-text-sm">No transactions yet</div>
                <div className="text-xs sm:text-sm text-gray-500 mobile-text-xs">
                  Transactions will appear here after funding and trading activity
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        {selectedTopTab === 'portfolio' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 mb-4 md:mb-8 mobile-card">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 px-2 sm:px-3 md:px-6 overflow-x-auto scrollbar-hide mobile-scroll-container mobile-space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-2 sm:py-3 md:py-4 border-b-2 font-medium text-xs sm:text-sm transition-colors mobile-tab whitespace-nowrap mobile-nav-tab ${
                    selectedTab === tab.id
                      ? 'border-navy-600 text-navy-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline text-xs sm:text-sm mobile-text-xs">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-2 sm:p-3 md:p-6 mobile-compact-padding">
            {selectedTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6 md:space-y-8 mobile-space-y-2">
                <div>
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy-900 mb-3 sm:mb-4 md:mb-6 mobile-text-base">Asset Allocation</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-8 mobile-grid">
                    <div className="space-y-2 sm:space-y-3 md:space-y-4 mobile-space-y-1">
                      {holdings.map((holding, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg mobile-button mobile-compact-padding">
                          <div className="flex-1">
                            <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mobile-text-xs">{holding.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{holding.allocation}% allocation • {holding.risk} risk</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mobile-text-xs">
                              ${holding.value.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-green-600 mobile-text-xs">+{holding.return}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-navy-50 rounded-lg p-3 sm:p-4 md:p-6 mobile-card">
                      <h4 className="text-xs sm:text-sm md:text-base font-medium text-navy-900 mb-3 sm:mb-4 mobile-text-sm">Performance Metrics</h4>
                      <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 mobile-text-xs">Sharpe Ratio</span>
                          <span className="text-xs sm:text-sm font-medium text-navy-900 mobile-text-xs">2.84</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 mobile-text-xs">Max Drawdown</span>
                          <span className="text-xs sm:text-sm font-medium text-navy-900 mobile-text-xs">-4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 mobile-text-xs">Volatility</span>
                          <span className="text-xs sm:text-sm font-medium text-navy-900 mobile-text-xs">8.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'holdings' && (
              <div className="space-y-4 sm:space-y-6 mobile-space-y-2">
                <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy-900 mobile-text-base">Detailed Holdings</h3>
                <div className="overflow-x-auto -mx-2 sm:-mx-3 md:mx-0 mobile-scroll-container">
                  <table className="w-full mobile-table">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-text-xs">Fund Name</th>
                        <th className="text-right py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-text-xs">Allocation</th>
                        <th className="text-right py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-text-xs">Value</th>
                        <th className="text-right py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-text-xs">Return</th>
                        <th className="text-right py-1 sm:py-2 md:py-3 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-hide">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-0 text-xs font-medium text-gray-900 mobile-text-xs">{holding.name}</td>
                          <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-0 text-xs text-right text-gray-600 mobile-text-xs">{holding.allocation}%</td>
                          <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-0 text-xs text-right font-medium text-gray-900 mobile-text-xs">
                            ${holding.value.toLocaleString()}
                          </td>
                          <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-0 text-xs text-right font-medium text-green-600 mobile-text-xs">
                            +{holding.return}%
                          </td>
                          <td className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-0 text-right mobile-hide">
                            <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium mobile-ultra-compact ${
                              holding.risk === 'Low' ? 'bg-green-100 text-green-800' :
                              holding.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {holding.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'transactions' && (
              <div className="space-y-4 sm:space-y-6 mobile-space-y-2">
                <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy-900 mobile-text-base">Recent Transactions</h3>
                <div className="space-y-2 sm:space-y-3 mobile-space-y-1">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mobile-button mobile-compact-padding">
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mobile-text-xs">{transaction.type}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{transaction.fund} • {transaction.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs sm:text-sm md:text-base font-medium mobile-text-xs ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{transaction.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-4 sm:space-y-6 mobile-space-y-2">
                <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy-900 mobile-text-base">Investment Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mobile-grid">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mobile-button mobile-compact-padding">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 mobile-space-x-1">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mobile-text-xs">{doc.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mobile-text-xs">{doc.type} • {doc.date}</div>
                        </div>
                      </div>
                      <button className="text-navy-600 hover:text-navy-700 font-medium text-xs px-2 py-1 rounded border border-navy-200 hover:bg-navy-50 transition-colors mobile-button mobile-ultra-compact">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default InvestorDashboard