import React, { useState } from 'react'
import { BarChart3, Activity, LogOut, TrendingUp, Menu, X } from 'lucide-react'
import InvestorDashboard from './InvestorDashboard'
import HeliosDashboard from './HeliosDashboard'
import { useAuth } from './auth/AuthProvider'

interface DashboardSelectorProps {
  onShowKYCProgress?: () => void
}

export function DashboardSelector({ onShowKYCProgress }: DashboardSelectorProps) {
  const { user, signOut, account } = useAuth()
  const [selectedDashboard, setSelectedDashboard] = useState<'investor' | 'helios'>('investor')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      console.log('🚪 Dashboard sign out initiated')
      
      // Check for active session before signing out
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        console.log('ℹ️ No active session, clearing local state')
        // Clear local state and reload
        window.location.reload()
        return
      }
      
      await signOut()
      console.log('✅ Sign out completed')
    } catch (error) {
      console.warn('⚠️ Sign out error, forcing reload:', error)
      // Force reload on sign out error
      window.location.reload()
    }
  }

  // Dashboard switcher header
  const DashboardSwitcher = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
          <div className="flex items-center space-x-1 sm:space-x-2 mobile-space-x-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-navy-600 rounded border border-gray-200 flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">G</span>
            </div>
            <span className="font-serif text-sm sm:text-lg md:text-xl font-bold text-navy-900 mobile-text-sm">
              Global Market Consulting
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-button mobile-compact-padding"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Dashboard Toggle */}
            <div className="flex items-center space-x-2 lg:space-x-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedDashboard('investor')}
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors mobile-button text-sm lg:text-base ${
                  selectedDashboard === 'investor'
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-600 hover:text-navy-600'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden lg:inline">Investor Portal</span>
                <span className="lg:hidden">Investor</span>
              </button>
              <button
                onClick={() => setSelectedDashboard('helios')}
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 rounded-md font-medium transition-colors mobile-button text-sm lg:text-base ${
                  selectedDashboard === 'helios'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span className="hidden lg:inline">Live Trading</span>
                <span className="lg:hidden">Trading</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="text-right">
                <div className="text-xs lg:text-sm font-medium text-gray-900">
                  ${(account?.balance || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 hidden lg:block">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 lg:space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 mobile-button text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 mobile-space-y-1">
              {/* Dashboard Toggle Mobile */}
              <div className="space-y-1 sm:space-y-2 mobile-space-y-1">
                <button
                  onClick={() => {
                    setSelectedDashboard('investor')
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors mobile-button mobile-compact-padding mobile-space-x-1 ${
                    selectedDashboard === 'investor'
                      ? 'bg-navy-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base mobile-text-sm">Investor Portal</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDashboard('helios')
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors mobile-button mobile-compact-padding mobile-space-x-1 ${
                    selectedDashboard === 'helios'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base mobile-text-sm">Helios Trading</span>
                </button>
              </div>
              
              {/* Account Info Mobile */}
              <div className="border-t border-gray-200 pt-2 sm:pt-3">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mobile-text-xs">
                      ${(account?.balance || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mobile-text-xs">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-navy-600 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 mobile-button mobile-compact-padding mobile-space-x-1"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm mobile-text-xs">Sign Out</span>
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
      <InvestorDashboard onShowKYCProgress={onShowKYCProgress} />
    </>
  )
}