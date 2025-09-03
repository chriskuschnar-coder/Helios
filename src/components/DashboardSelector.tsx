import React, { useState } from 'react'
import { BarChart3, Activity, LogOut, TrendingUp, Menu, X } from 'lucide-react'
import InvestorDashboard from './InvestorDashboard'
import { HeliosDashboard } from './HeliosDashboard'
import { useAuth } from './auth/AuthProvider'

export function DashboardSelector() {
  const { user, signOut, account } = useAuth()
  const [selectedDashboard, setSelectedDashboard] = useState<'investor' | 'helios'>('investor')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Dashboard switcher header
  const DashboardSwitcher = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-navy-600" />
            <span className="font-serif text-lg md:text-xl font-bold text-navy-900 hidden sm:block">
              Global Market Consulting
            </span>
            <span className="font-serif text-lg font-bold text-navy-900 sm:hidden">
              GMC
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-button"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dashboard Toggle */}
            <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedDashboard('investor')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors mobile-button ${
                  selectedDashboard === 'investor'
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-600 hover:text-navy-600'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Investor Portal</span>
              </button>
              <button
                onClick={() => setSelectedDashboard('helios')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors mobile-button ${
                  selectedDashboard === 'helios'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Helios Trading</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  ${(account?.balance || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 mobile-button"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {/* Dashboard Toggle Mobile */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedDashboard('investor')
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors mobile-button ${
                    selectedDashboard === 'investor'
                      ? 'bg-navy-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Investor Portal</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDashboard('helios')
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors mobile-button ${
                    selectedDashboard === 'helios'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  <span>Helios Trading</span>
                </button>
              </div>
              
              {/* Account Info Mobile */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(account?.balance || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 mobile-button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (selectedDashboard === 'helios') {
    return (
      <>
        <DashboardSwitcher />
        <HeliosDashboard />
      </>
    )
  }

  return (
    <>
      <DashboardSwitcher />
      <InvestorDashboard />
    </>
  )
}