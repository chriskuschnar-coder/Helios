'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  LogOut, 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export function InvestorDashboard() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('overview')

  const portfolioData = {
    totalValue: 2450000,
    monthlyReturn: 2.4,
    yearlyReturn: 12.8,
    totalReturn: 45.2
  }

  const holdings = [
    { name: 'Global Equity Fund', allocation: 65, value: 1592500, return: 14.2 },
    { name: 'Fixed Income Fund', allocation: 25, value: 612500, return: 8.7 },
    { name: 'Alternative Investments', allocation: 10, value: 245000, return: 18.9 }
  ]

  const recentTransactions = [
    { date: '2025-01-15', type: 'Dividend', amount: 12500, fund: 'Global Equity Fund' },
    { date: '2025-01-10', type: 'Investment', amount: 100000, fund: 'Fixed Income Fund' },
    { date: '2025-01-05', type: 'Rebalancing', amount: -25000, fund: 'Alternative Investments' }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'holdings', name: 'Holdings', icon: PieChart },
    { id: 'documents', name: 'Documents', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-max section-padding">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-navy-600" />
              <span className="font-serif text-xl font-bold text-navy-900">
                Global Market Consulting
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user?.name || session?.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-8">
        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Portfolio Value</span>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-navy-900">
              ${portfolioData.totalValue.toLocaleString()}
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Monthly Return</span>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-green-600">
              +{portfolioData.monthlyReturn}%
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">YTD Return</span>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-green-600">
              +{portfolioData.yearlyReturn}%
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Return</span>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-green-600">
              +{portfolioData.totalReturn}%
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
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
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Portfolio Overview</h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Asset Allocation</h4>
                    <div className="space-y-4">
                      {holdings.map((holding, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{holding.name}</div>
                            <div className="text-sm text-gray-600">{holding.allocation}% allocation</div>
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
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.type}</div>
                            <div className="text-sm text-gray-600">{transaction.fund}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">{transaction.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'holdings' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Portfolio Holdings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-900">Fund Name</th>
                        <th className="text-right py-3 font-medium text-gray-900">Allocation</th>
                        <th className="text-right py-3 font-medium text-gray-900">Market Value</th>
                        <th className="text-right py-3 font-medium text-gray-900">Return</th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-navy-900">Investment Documents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Monthly Performance Report - January 2025',
                    'Quarterly Investment Letter - Q4 2024',
                    'Annual Tax Statement - 2024',
                    'Risk Disclosure Statement',
                    'Investment Agreement',
                    'Compliance Documentation'
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{doc}</span>
                      </div>
                      <button className="text-navy-600 hover:text-navy-700 font-medium text-sm">
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