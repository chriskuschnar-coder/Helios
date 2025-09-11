import React from 'react'
import { TrendingUp, Plus, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface NavigationBarProps {
  onFundAccount: () => void
  currentPage?: string
}

export function NavigationBar({ onFundAccount, currentPage = 'portfolio' }: NavigationBarProps) {
  const { user, signOut, account } = useAuth()

  const navItems = [
    { id: 'portfolio', name: 'Portfolio', href: '#portfolio' },
    { id: 'markets', name: 'Markets', href: '#markets' },
    { id: 'research', name: 'Research', href: '#research' },
    { id: 'transactions', name: 'Transactions', href: '#transactions' }
  ]

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="logo-section">
          <TrendingUp className="logo h-8 w-8 text-navy-600" />
          <span className="company-name">Global Market Consulting</span>
        </div>
      </div>
      
      <div className="nav-center">
        {navItems.map((item) => (
          <a 
            key={item.id}
            href={item.href} 
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
          >
            {item.name}
          </a>
        ))}
      </div>
      
      <div className="nav-right">
        <button className="nav-fund-button" onClick={onFundAccount}>
          <Plus className="plus-icon h-4 w-4" />
          Fund Account
        </button>
        
        <div className="account-menu">
          <div className="account-info">
            <div className="account-balance">
              ${(account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="account-type">Premium</div>
          </div>
          <div className="avatar-section">
            <div className="avatar">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <button 
              onClick={signOut}
              className="logout-btn"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}