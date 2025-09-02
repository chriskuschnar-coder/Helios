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
import '../styles/funding.css'

export function InvestorDashboard() {
  const { user, account, subscription, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedTopTab, setSelectedTopTab] = useState('portfolio')
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)

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

  const recentTransactions = [
    { date: '2025-01-15', type: 'Dividend', amount: 12500, fund: 'Alpha Fund', status: 'Completed' },
    { date: '2025-01-10', type: 'Investment', amount: 100000, fund: 'Market Neutral Fund', status: 'Completed' },
    { date: '2025-01-05', type: 'Rebalancing', amount: -25000, fund: 'Momentum Portfolio', status: 'Completed' },
    { date: '2025-01-01', type: 'Performance Fee', amount: -8500, fund: 'Alpha Fund', status: 'Completed' }
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="px-6 py-4">
            <nav className="flex space-x-8">
              {topTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTopTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    selectedTopTab === tab.id
                      ? 'bg-navy-600 text-white'
                      : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Investment Tab Content */}
        {selectedTopTab === 'invest' && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <StripeCheckout className="h-fit" />
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">Investment Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Secure payment processing via Stripe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Instant account funding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Professional investment management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Real-time portfolio tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Value Card */}
        {selectedTopTab === 'portfolio' && (
          <PortfolioValueCard 
            onFundPortfolio={openFunding}
            onWithdraw={() => console.log('Withdraw clicked')}
          />
        )}

        {/* Performance Summary Cards */}
        {selectedTopTab === 'portfolio' && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Daily P&L</span>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-green-600 mb-1">
                +${portfolioData.dailyPnL.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">+{portfolioData.dailyPnLPct}%</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">YTD Return</span>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-green-600 mb-1">
                +{portfolioData.yearlyReturn}%
              </div>
              <div className="text-sm text-gray-500">Outperforming benchmark</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Available Cash</span>
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-navy-900 mb-1">
                ${account?.available_balance?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Performance Chart */}
        {selectedTopTab === 'portfolio' && (
          <PortfolioPerformanceChart 
            currentBalance={account?.balance || 0}
            className="mb-8"
          />
        )}

        {/* Markets Tab Content */}
        {selectedTopTab === 'markets' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-navy-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-navy-900 mb-4">Live Market Data</h3>
              <p className="text-gray-600 mb-6">
                Real-time market analysis and quantitative insights across global markets.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-navy-50 rounded-lg p-6">
                  <div className="font-serif text-2xl font-bold text-navy-900 mb-2">S&P 500</div>
                  <div className="text-green-600 font-medium">+1.2% Today</div>
                  <div className="text-sm text-gray-600 mt-2">5,970.50</div>
                </div>
                <div className="bg-navy-50 rounded-lg p-6">
                  <div className="font-serif text-2xl font-bold text-navy-900 mb-2">Bitcoin</div>
                  <div className="text-green-600 font-medium">+2.4% Today</div>
                  <div className="text-sm text-gray-600 mt-2">$106,250</div>
                </div>
                <div className="bg-navy-50 rounded-lg p-6">
                  <div className="font-serif text-2xl font-bold text-navy-900 mb-2">Gold</div>
                  <div className="text-green-600 font-medium">+0.9% Today</div>
                  <div className="text-sm text-gray-600 mt-2">$2,685.50</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Tab Content */}
        {selectedTopTab === 'research' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-navy-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-navy-900 mb-4">Quantitative Research</h3>
              <p className="text-gray-600 mb-6">
                Access our latest research reports, market analysis, and quantitative insights.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-navy-50 rounded-lg p-6 text-left">
                  <h4 className="font-medium text-navy-900 mb-2">Latest Research Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Q1 2025 Market Outlook: Quantitative Signals Analysis</p>
                  <button className="text-navy-600 hover:text-navy-700 font-medium text-sm">
                    Download PDF →
                  </button>
                </div>
                <div className="bg-navy-50 rounded-lg p-6 text-left">
                  <h4 className="font-medium text-navy-900 mb-2">Strategy Performance</h4>
                  <p className="text-sm text-gray-600 mb-3">Monthly attribution analysis and factor decomposition</p>
                  <button className="text-navy-600 hover:text-navy-700 font-medium text-sm">
                    View Analysis →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab Content */}
        {selectedTopTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">Transaction History</h3>
            <div className="space-y-3">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{transaction.type}</div>
                    <div className="text-sm text-gray-600">{transaction.fund} • {transaction.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{transaction.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {selectedTopTab === 'portfolio' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-navy-600 text-navy-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">Asset Allocation</h3>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {holdings.map((holding, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{holding.name}</div>
                            <div className="text-sm text-gray-600">{holding.allocation}% allocation • {holding.risk} risk</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              ${holding.value.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600">+{holding.return}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-navy-50 rounded-lg p-6">
                      <h4 className="font-medium text-navy-900 mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sharpe Ratio</span>
                          <span className="font-medium text-navy-900">2.84</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Drawdown</span>
                          <span className="font-medium text-navy-900">-4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Volatility</span>
                          <span className="font-medium text-navy-900">8.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'holdings' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Detailed Holdings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-900">Fund Name</th>
                        <th className="text-right py-3 font-medium text-gray-900">Allocation</th>
                        <th className="text-right py-3 font-medium text-gray-900">Market Value</th>
                        <th className="text-right py-3 font-medium text-gray-900">Return</th>
                        <th className="text-right py-3 font-medium text-gray-900">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4 font-medium text-gray-900">{holding.name}</td>
                          <td className="py-4 text-right text-gray-600">{holding.allocation}%</td>
                          <td className="py-4 text-right font-medium text-gray-900">
                            ${holding.value.toLocaleString()}
                          </td>
                          <td className="py-4 text-right font-medium text-green-600">
                            +{holding.return}%
                          </td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{transaction.type}</div>
                        <div className="text-sm text-gray-600">{transaction.fund} • {transaction.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">{transaction.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Investment Documents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-600">{doc.type} • {doc.date}</div>
                        </div>
                      </div>
                      <button className="text-navy-600 hover:text-navy-700 font-medium text-sm px-3 py-1 rounded border border-navy-200 hover:bg-navy-50 transition-colors">
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