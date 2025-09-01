import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { EmptyPortfolioState } from './EmptyPortfolioState'
import { FundingModal } from './FundingModal'
import { SignedDocumentsList } from './SignedDocumentsList'
import { NavigationBar } from './NavigationBar'
import { BarChart3, FileText, TrendingUp, DollarSign, Users, Activity } from 'lucide-react'

export function InvestorDashboard() {
  const { user, account } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('portfolio')

  const balance = account?.balance || 0
  const hasBalance = balance > 0

  const openFunding = (amount: number | null = null) => {
    setPrefilledAmount(amount)
    setShowFundingModal(true)
  }

  const handleFundingSuccess = () => {
    setShowFundingModal(false)
    setPrefilledAmount(null)
  }

  const handleProceedToPayment = (amount: number, method: string) => {
    setShowFundingModal(false)
    console.log('Proceeding to payment:', { amount, method })
  }

  const handleWithdraw = () => {
    console.log('Withdraw functionality')
  }

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: BarChart3 },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'transactions', name: 'Transactions', icon: Activity },
    { id: 'settings', name: 'Settings', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar onFundAccount={() => openFunding()} currentPage={activeTab} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-0 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-navy-600 border-b-2 border-navy-600 bg-navy-50'
                    : 'text-gray-600 hover:text-navy-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <PortfolioValueCard 
              onFundPortfolio={openFunding}
              onWithdraw={handleWithdraw}
            />
            
            {hasBalance ? (
              <div className="grid lg:grid-cols-2 gap-8">
                <PortfolioPerformanceChart currentBalance={balance} />
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Portfolio Rebalance</div>
                          <div className="text-sm text-gray-600">Automated optimization</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">+2.4%</div>
                        <div className="text-sm text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Dividend Payment</div>
                          <div className="text-sm text-gray-600">Quarterly distribution</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">$1,247</div>
                        <div className="text-sm text-gray-500">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyPortfolioState onFundPortfolio={() => openFunding()} />
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">
                Investment Documents
              </h2>
              <p className="text-gray-600">
                View and download your signed investment documents and agreements.
              </p>
            </div>
            <SignedDocumentsList />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">
              Transaction History
            </h2>
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-600">
                Your transaction history will appear here after you make your first investment.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">
              Account Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.full_name || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        prefilledAmount={prefilledAmount}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  )
}