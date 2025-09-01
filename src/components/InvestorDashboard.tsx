import React, { useState } from 'react';
import { BarChart3, FileText, TrendingUp, CreditCard, User, Settings } from 'lucide-react';
import PortfolioValueCard from './PortfolioValueCard';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import TradingViewBTCChart from './TradingViewBTCChart';
import SignedDocumentsList from './SignedDocumentsList';

type TabType = 'portfolio' | 'markets' | 'research' | 'transactions' | 'invest' | 'documents';

export default function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  const tabs = [
    { id: 'portfolio' as TabType, label: 'Portfolio', icon: BarChart3 },
    { id: 'markets' as TabType, label: 'Markets', icon: TrendingUp },
    { id: 'research' as TabType, label: 'Research', icon: FileText },
    { id: 'transactions' as TabType, label: 'Transactions', icon: CreditCard },
    { id: 'invest' as TabType, label: 'Invest', icon: TrendingUp },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <div className="space-y-6">
            <PortfolioValueCard />
            <PortfolioPerformanceChart />
          </div>
        );
      case 'markets':
        return (
          <div className="space-y-6">
            <TradingViewBTCChart />
          </div>
        );
      case 'research':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Research Center</h3>
            <p className="text-gray-600">Market analysis and investment research coming soon.</p>
          </div>
        );
      case 'transactions':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction History</h3>
            <p className="text-gray-600">Your transaction history will appear here.</p>
          </div>
        );
      case 'invest':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Opportunities</h3>
            <p className="text-gray-600">New investment opportunities will be displayed here.</p>
          </div>
        );
      case 'documents':
        return <SignedDocumentsList />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Global Markets Consulting</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderTabContent()}
      </main>
    </div>
  );
}