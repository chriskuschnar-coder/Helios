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
    <div className="glass backdrop-blur-strong sticky top-0 z-50 safe-area-top border-b border-white/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          <div className="flex items-center space-x-1 sm:space-x-2 mobile-space-x-1">
            <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-premium text-lg md:text-xl text-white mobile-text-sm">
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
          <div className="hidden md:flex items-center space-x-6">
            {/* Dashboard Toggle */}
            <div className="flex items-center space-x-2 glass-dark rounded-xl p-2">
              <button
                onClick={() => setSelectedDashboard('investor')}
                className={`nav-tab ${
                  selectedDashboard === 'investor'
                    ? 'active'
                    : ''
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Investor</span>
              </button>
              <button
                onClick={() => setSelectedDashboard('helios')}
                className={`nav-tab ${
                  selectedDashboard === 'helios'
                    ? 'active'
                    : ''
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Helios</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-white">
                <div className="text-sm font-bold">
                  ${(account?.balance || 0).toLocaleString()}
                </div>
                <div className="text-xs opacity-70">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="glass-button text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 glass">
            <div className="px-4 py-4 space-y-3">
              {/* Dashboard Toggle Mobile */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedDashboard('investor')
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full nav-tab ${
                    selectedDashboard === 'investor'
                      ? 'active'
                      : ''
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
                  className={`w-full nav-tab ${
                    selectedDashboard === 'helios'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  <span>Helios Trading</span>
                </button>
              </div>
              
              {/* Account Info Mobile */}
              <div className="border-t border-white/20 pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-sm font-bold">
                      ${(account?.balance || 0).toLocaleString()}
                    </div>
                    <div className="text-xs opacity-70">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="glass-button text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
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