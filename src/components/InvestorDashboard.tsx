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

export function InvestorDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showFunding, setShowFunding] = useState(false)
  const [fundingAmount, setFundingAmount] = useState(1000)

  const portfolioData = {
    totalValue: account?.balance || 0,
    monthlyReturn: 2.4,
    yearlyReturn: 12.8,
    totalReturn: 45.2,
    dailyPnL: 18500,
    dailyPnLPct: 0.76
  }

  const holdings = [
    { name: 'Alpha Fund', allocation: 65, value: (account?.balance || 0) * 0.65, return: 14.2, risk: 'Medium' },
    { name: 'Market Neutral Fund', allocation: 25, value: (account?.balance || 0) * 0.25, return: 8.7, risk: 'Low' },
    { name: 'Momentum Portfolio', allocation: 10, value: (account?.balance || 0) * 0.10, return: 18.9, risk: 'High' }
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

  const handleFundingSuccess = () => {
    setShowFunding(false)
    setFundingAmount(1000)
    // Account will be refreshed automatically by the success page
  }

  // Show empty state if no balance
  if (!account || account.balance === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Investment Account
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your account is ready! Add capital to start investing with our quantitative strategies.
          </p>
          <button
            onClick={() => setShowFunding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Capital
          </button>
        </div>

        {/* Funding Modal */}
        {showFunding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Capital</h3>
                <button
                  onClick={() => setShowFunding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="100"
                    max="10000000"
                    step="100"
                    placeholder="1000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
              </div>

              {fundingAmount >= 100 ? (
                <CheckoutButton
                  amount={fundingAmount}
                  onSuccess={handleFundingSuccess}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium"
                >
                  Proceed to Secure Checkout
                </CheckoutButton>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Enter amount $100 or more
                </button>
              )}

              <button
                onClick={() => setShowFunding(false)}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Portfolio Value</span>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-navy-900 mb-1">
            ${portfolioData.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Institutional Account</div>
        </div>
        
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
          <button
            onClick={() => setShowFunding(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add Capital
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beta</span>
                        <span className="font-medium text-navy-900">0.65</span>
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

      {/* Funding Modal */}
      {showFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Capital to Account</h3>
              <button
                onClick={() => setShowFunding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="100"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: $100</p>
            </div>

            {fundingAmount >= 100 ? (
              <CheckoutButton
                amount={fundingAmount}
                onSuccess={handleFundingSuccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium"
              >
                Proceed to Secure Checkout
              </CheckoutButton>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-700 text-sm">
                    Please enter an amount of $100 or more
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowFunding(false)}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}