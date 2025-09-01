import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { 
  BarChart3, 
  PieChart, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Activity,
  X
} from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'
import { PaymentProcessor } from './PaymentProcessor'

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
  const { user, account, refreshAccount } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false)
  const [fundingAmount, setFundingAmount] = useState('')
  const [fundingAmountForPayment, setFundingAmountForPayment] = useState(0)
  const [isProcessingFunding, setIsProcessingFunding] = useState(false)
  const [transferStatus, setTransferStatus] = useState<string | null>(null)

  useEffect(() => {
    // Load user-specific data
    const timer = setTimeout(() => {
      // Load transactions based on account balance
      if (account) {
        const transactionList = []
        
        if (account.total_deposits > 0) {
          transactionList.push({
            id: '1',
            type: 'deposit',
            amount: account.total_deposits,
            status: 'completed',
            created_at: '2025-01-10T10:30:00Z',
            description: 'Initial capital deposit'
          })
        }
        
        // Add profit transactions if balance is higher than deposits
        const profit = account.balance - account.total_deposits
        if (profit > 0) {
          transactionList.push({
            id: '2',
            type: 'profit',
            amount: profit,
            status: 'completed',
            created_at: '2025-01-15T14:20:00Z',
            description: 'Trading profits'
          })
        }
        
        setTransactions(transactionList)
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, account])

  const handleFunding = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(fundingAmount)
    
    if (amount < 100) {
      setTransferStatus('Minimum funding amount is $100')
      return
    }
    
    // Show payment processor
    setFundingAmountForPayment(amount)
    setShowPaymentProcessor(true)
    setShowFundingModal(false)
  }

  const handlePaymentSuccess = async (paymentResult: any) => {
    setIsProcessingFunding(true)
    setShowPaymentProcessor(false)
    setTransferStatus(null)
    
    try {
      console.log('💰 Processing funding after payment:', paymentResult)
      
      // Process funding through Supabase
      const result = await supabaseClient.processFunding(
        paymentResult.amount, 
        paymentResult.method, 
        `Account funding via ${paymentResult.method} - ${paymentResult.id}`
      )
      
      if (result.success) {
        // Update local account state immediately for better UX
        if (account) {
          await refreshAccount()
        }
        
        setTransferStatus(`Funds added successfully! Payment ID: ${paymentResult.id}`)
        console.log('✅ Funding successful')
      } else {
        setTransferStatus(result.error?.message || 'Funding failed. Please try again.')
        console.log('❌ Funding failed:', result.error)
      }
    } catch (error) {
      console.error('Funding error:', error)
      setTransferStatus('An error occurred. Please try again.')
    } finally {
      setIsProcessingFunding(false)
      setShowFundingModal(true)
      setTimeout(() => {
        setShowFundingModal(false)
        setFundingAmount('')
        setTransferStatus(null)
      }, 3000)
    }
  }

  const handlePaymentError = (error: string) => {
    setShowPaymentProcessor(false)
    setShowFundingModal(true)
    setTransferStatus(`Payment failed: ${error}`)
  }

  // Calculate portfolio data based on user's actual account
  const portfolioData = account ? {
    totalValue: account.balance,
    monthlyReturn: account.total_deposits > 0 ? ((account.balance - account.total_deposits) / account.total_deposits * 100) : 0,
    yearlyReturn: account.total_deposits > 0 ? ((account.balance - account.total_deposits) / account.total_deposits * 100) : 0,
    totalReturn: account.total_deposits > 0 ? ((account.balance - account.total_deposits) / account.total_deposits * 100) : 0,
    dailyPnL: account.balance - account.total_deposits,
    dailyPnLPct: account.total_deposits > 0 ? ((account.balance - account.total_deposits) / account.total_deposits * 100) : 0
  } : {
    totalValue: 0,
    monthlyReturn: 0,
    yearlyReturn: 0,
    totalReturn: 0,
    dailyPnL: 0,
    dailyPnLPct: 0
  }

  const holdings = account ? [
    { 
      name: 'Trading Account', 
      allocation: 100, 
      value: account.balance, 
      return: portfolioData.totalReturn, 
      risk: 'High' 
    }
  ] : [
    { name: 'No Account', allocation: 0, value: 0, return: 0, risk: 'None' }
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
                  <button
                    onClick={() => setShowFundingModal(true)}
                    className="flex items-center space-x-2 bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Add Capital</span>
                  </button>
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
                          <td className="py-4 text-right text-gray-600">100%</td>
                          <td className="py-4 text-right font-medium text-gray-900">
                            ${holding.value.toLocaleString()}
                          </td>
                          <td className="py-4 text-right font-medium text-red-600">
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

        {/* Funding Modal */}
        {showFundingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Capital</h3>
                <button
                  onClick={() => setShowFundingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFunding} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      placeholder="0.00"
                      min="100"
                      step="0.01"
                      required
                    />
                  </div>
                  {transferStatus && (
                    <div className={`p-3 rounded-lg text-sm ${
                      transferStatus.includes('success') || transferStatus.includes('Connected') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : transferStatus.includes('failed') || transferStatus.includes('error')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {transferStatus}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Minimum funding: $100</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFundingModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingFunding}
                    className="flex-1 bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isProcessingFunding ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}