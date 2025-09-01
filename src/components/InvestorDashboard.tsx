import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { EmptyPortfolioState } from './EmptyPortfolioState'
import { PortfolioValueCard } from './PortfolioValueCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { FundingModal } from './FundingModal'
import { DocumentSigningPage } from './DocumentSigningPage'
import { TrendingUp, BarChart3, DollarSign, Users, Award, Shield, Activity, Clock } from 'lucide-react'

export function InvestorDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [showDocumentSigning, setShowDocumentSigning] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)

  const currentBalance = account?.balance || 0
  const availableBalance = account?.available_balance || 0

  // Check if user needs to sign documents (has $0 balance)
  const needsDocumentSigning = currentBalance === 0

  const openFunding = (amount: number | null = null) => {
    if (needsDocumentSigning) {
      setShowDocumentSigning(true)
    } else {
      setPrefilledAmount(amount)
      setShowFundingModal(true)
    }
  }

  const handleDocumentsComplete = () => {
    setShowDocumentSigning(false)
    setShowFundingModal(true)
  }

  const handleFundingSuccess = () => {
    setShowFundingModal(false)
    setPrefilledAmount(null)
    refreshAccount()
  }

  const handleWithdraw = () => {
    console.log('Withdraw functionality to be implemented')
  }

  // Show document signing page if needed
  if (showDocumentSigning) {
    return <DocumentSigningPage onDocumentsComplete={handleDocumentsComplete} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-navy-900">Investment Portfolio</h1>
              <p className="text-gray-600 mt-1">Global Market Consulting Fund</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Account Status</div>
                <div className="font-medium text-green-600">Qualified Investor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentBalance === 0 ? (
          <EmptyPortfolioState onFundAccount={openFunding} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Portfolio Value */}
            <div className="lg:col-span-1">
              <PortfolioValueCard 
                onFundPortfolio={openFunding}
                onWithdraw={handleWithdraw}
              />
              
              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-serif text-lg font-bold text-navy-900 mb-4">Account Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Balance</span>
                    <span className="font-bold text-navy-900">${availableBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Deposits</span>
                    <span className="font-bold text-green-600">${(account?.total_deposits || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Withdrawals</span>
                    <span className="font-bold text-gray-600">${(account?.total_withdrawals || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Net Investment</span>
                      <span className="font-bold text-navy-900">
                        ${((account?.total_deposits || 0) - (account?.total_withdrawals || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Performance Chart */}
            <div className="lg:col-span-2">
              <PortfolioPerformanceChart 
                currentBalance={currentBalance}
                className="mb-6"
              />
              
              {/* Investment Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900">Performance</h3>
                      <p className="text-sm text-gray-600">YTD Returns</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Return</span>
                      <span className="font-bold text-green-600">+22.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio</span>
                      <span className="font-bold text-navy-900">3.12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Drawdown</span>
                      <span className="font-bold text-gold-600">3.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-navy-600" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900">Risk Metrics</h3>
                      <p className="text-sm text-gray-600">Portfolio Risk</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatility</span>
                      <span className="font-bold text-navy-900">8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beta</span>
                      <span className="font-bold text-navy-900">0.42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VaR (95%)</span>
                      <span className="font-bold text-gold-600">2.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Shield className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">SEC Registered</h4>
            <p className="text-sm text-gray-600">Fully compliant investment advisor</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Users className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">Qualified Investors</h4>
            <p className="text-sm text-gray-600">Accredited investor requirements</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Award className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">SIPC Protected</h4>
            <p className="text-sm text-gray-600">Investor protection coverage</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <Activity className="h-8 w-8 text-navy-600 mx-auto mb-3" />
            <h4 className="font-medium text-navy-900 mb-2">Real-time Trading</h4>
            <p className="text-sm text-gray-600">Live market execution</p>
          </div>
        </div>
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        currentBalance={currentBalance}
        availableBalance={availableBalance}
      />
    </div>
  )
}