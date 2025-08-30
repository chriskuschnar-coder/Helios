import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'

interface Account {
  id: string
  balance: number
  available_balance: number
  total_deposits: number
  total_withdrawals: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  description: string
}

export function InvestorDashboard() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading and use demo data
    const timer = setTimeout(() => {
      setAccount({
        id: 'demo-account',
        balance: 7850.00,
        available_balance: 7850.00,
        total_deposits: 8000.00,
        total_withdrawals: 0
      })
      setTransactions([
        {
          id: '1',
          type: 'deposit',
          amount: 8000,
          status: 'completed',
          created_at: '2025-01-10T10:30:00Z',
          description: 'Initial capital deposit'
        },
        {
          id: '2',
          type: 'profit',
          amount: 150,
          status: 'completed',
          created_at: '2025-01-15T14:20:00Z',
          description: 'Trading profit - BTCUSD position'
        },
        {
          id: '3',
          type: 'profit',
          amount: 75,
          status: 'completed',
          created_at: '2025-01-15T14:25:00Z',
          description: 'Trading profit - ETHUSD position'
        }
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  const portfolioData = {
    totalValue: 7850,
    monthlyReturn: 1.9,
    yearlyReturn: 1.9,
    totalReturn: -1.9,
    dailyPnL: 150,
    dailyPnLPct: 1.9
  }

  const holdings = [
    { name: 'Trading Account', allocation: 100, value: 7850, return: -1.9, risk: 'High' }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <div className="text-navy-900 text-lg font-medium">Loading Dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
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
            <div className="text-sm text-gray-500">Trading Account</div>
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
            <div className="text-sm text-gray-500">Since January 2025</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Return</span>
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-red-600 mb-1">
              +{portfolioData.totalReturn}%
            </div>
            <div className="text-sm text-gray-500">Since inception</div>
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
                          <span className="font-medium text-navy-900">3.12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Drawdown</span>
                          <span className="font-medium text-navy-900">-3.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Volatility</span>
                          <span className="font-medium text-navy-900">12.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Beta</span>
                          <span className="font-medium text-navy-900">0.89</span>
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
                  {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 capitalize">{transaction.type}</div>
                          <div className="text-sm text-gray-600">{transaction.description || 'Investment transaction'}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">{transaction.status}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No transactions yet. Your investment activity will appear here.
                    </div>
                  )}
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
      </div>
    </div>
  )
}