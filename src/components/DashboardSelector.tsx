'use client'

import { useState } from 'react'
import { BarChart3, Activity, ArrowLeft, TrendingUp } from 'lucide-react'
import { InvestorDashboard } from './InvestorDashboard'
import { HeliosDashboard } from './HeliosDashboard'
import { useAuth } from './auth/AuthProvider'

export function DashboardSelector() {
  const [selectedDashboard, setSelectedDashboard] = useState<'investor' | 'helios'>('investor')
  const { signOut } = useAuth()

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
      {/* Dashboard Selector Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-navy-600" />
                <span className="font-serif text-xl font-bold text-navy-900">
                  Global Market Consulting
                </span>
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">Investment Dashboard</h1>
                <p className="text-sm text-gray-600">Choose your preferred view</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium">{dashboard.name}</div>
                      <div className="text-xs opacity-75">{dashboard.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedDashboard === 'investor' ? <InvestorDashboard /> : <HeliosDashboard />}
    </div>
  )
}