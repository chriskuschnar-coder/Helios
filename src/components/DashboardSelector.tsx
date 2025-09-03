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
    <div className="nav-container">
      <div className="exchange-container">
        <div className="flex justify-between items-center h-20">
          <div className="nav-brand">
            <div className="nav-logo">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="nav-title">
              Global Market Consulting
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Dashboard Toggle */}
            <div className="nav-tabs">
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
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-bold text-gradient">
                  ${(account?.balance || 0).toLocaleString()}
                </div>
                <div className="text-xs text-white opacity-60">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="exchange-button text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 exchange-card-dark">
            <div className="px-6 py-6 space-y-4">
              {/* Dashboard Toggle Mobile */}
              <div className="space-y-3">
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
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gradient">
                      ${(account?.balance || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-white opacity-60">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="exchange-button text-sm"
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
    <div className="min-h-screen bg-black">
      <div className="exchange-nav">
        <DashboardSwitcher />
      </div>
      <InvestorDashboard />
    </div>
  )
}