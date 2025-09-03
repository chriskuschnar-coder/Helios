import React, { useState } from 'react';
import { Plus, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { FundingModal } from './FundingModal';
import { PortfolioValueCard } from './PortfolioValueCard';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';
import { TransactionsTab } from './TransactionsTab';
import { SubscriptionStatus } from './SubscriptionStatus';
import { useAuth } from './auth/AuthProvider';

export function InvestorDashboard() {
  const { user, account } = useAuth();
  const [showFundingModal, setShowFundingModal] = useState(false);

  const stats = [
    {
      title: 'Portfolio Value',
      value: `$${(account?.balance || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'Available Cash',
      value: `$${(account?.available_balance || 0).toLocaleString()}`,
      change: 'Ready to invest',
      changeType: 'neutral' as const,
      icon: TrendingUp
    },
    {
      title: 'Total Return',
      value: '+$2,847',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Activity
    },
    {
      title: 'Time Invested',
      value: '127 days',
      change: 'Since inception',
      changeType: 'neutral' as const,
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Investor'}
          </h1>
          <p className="text-gray-600">
            Here's your portfolio performance and investment overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-navy-100 rounded-lg">
                  <stat.icon className="h-6 w-6 text-navy-600" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioValueCard />
            <PortfolioPerformanceChart />
            <TransactionsTab />
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowFundingModal(true)}
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Funds
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  Withdraw Funds
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                  View Statements
                </button>
              </div>
            </div>

            <SubscriptionStatus />

            {/* Account Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-gray-900">Individual</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">KYC Status</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Profile</span>
                  <span className="font-medium text-gray-900">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Since</span>
                  <span className="font-medium text-gray-900">Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
      />
    </div>
  );
}