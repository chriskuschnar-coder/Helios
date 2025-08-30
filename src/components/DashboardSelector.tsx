'use client'

import { useState } from 'react'
import { BarChart3, Activity, Settings, LogOut, TrendingUp } from 'lucide-react'
import { InvestorDashboard } from './InvestorDashboard'
import { HeliosDashboard } from './HeliosDashboard'
import { useAuth } from './auth/AuthProvider'

export function DashboardSelector() {
  const { user, signOut } = useAuth()
  const [selectedDashboard, setSelectedDashboard] = useState<'investor' | 'helios'>('investor')

  const dashboards = [
    {
      id: 'investor' as const,
      name: 'Investor Portal',
      description: 'Traditional investment overview',
      icon: BarChart3
    },
    {
      id: 'helios' as const,
      name: 'Helios Trading',
      description: 'Live trading dashboard',
      icon: Activity
    }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedDashboard === 'investor' ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-navy-600" />
                  <span className="font-serif text-xl font-bold text-navy-900">
                    Global Market Consulting
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {dashboards.map((dashboard) => (
                      <button
                        key={dashboard.id}
                        onClick={() => setSelectedDashboard(dashboard.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDashboard === dashboard.id
                            ? 'bg-navy-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <dashboard.icon className="h-4 w-4" />
                        <span>{dashboard.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Welcome back</div>
                    <div className="text-xs text-gray-600">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
          <InvestorDashboard />
        </div>
      ) : (
        <HeliosDashboard />
      )}
      {/* Dashboard Selector Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Investment Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Choose your preferred view</p>
            </div>
            <div className="flex space-x-2">
              {dashboards.map((dashboard) => (
                <button
                  key={dashboard.id}
                  onClick={() => setSelectedDashboard(dashboard.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedDashboard === dashboard.id
                      ? 'bg-navy-600 border-navy-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <dashboard.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{dashboard.name}</div>
                    <div className="text-xs opacity-75">{dashboard.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedDashboard === 'investor' ? <InvestorDashboard /> : <HeliosDashboard />}
    </div>
  )
}