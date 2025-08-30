'use client'

import { useState } from 'react'
import { BarChart3, Activity, Settings } from 'lucide-react'
import { InvestorDashboard } from './InvestorDashboard'
import { HeliosDashboard } from './HeliosDashboard'

export function DashboardSelector() {
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

  return (
    <div className="min-h-screen bg-gray-50">
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