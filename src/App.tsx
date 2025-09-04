import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Performance } from './components/Performance'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { DashboardSelector } from './components/DashboardSelector'
import { FundingSuccessPage } from './components/FundingSuccessPage'
import { FundingCancelledPage } from './components/FundingCancelledPage'
import { CancelPage } from './components/CancelPage'
import { SuccessPage } from './components/SuccessPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing')

  // Check URL for special pages
  useEffect(() => {
    const path = window.location.pathname
    const search = window.location.search
    
    if (path === '/funding-success' || search.includes('session_id')) {
      // Don't change view - let the success page handle this
      return
    }
    
    if (path === '/funding-cancelled' || path === '/cancel') {
      // Don't change view - let the cancel page handle this
      return
    }
    
    if (path === '/success') {
      // Don't change view - let the success page handle this
      return
    }
  }, [])

  // Handle special pages based on URL
  const path = window.location.pathname
  const search = window.location.search
  
  if (path === '/funding-success' || search.includes('session_id')) {
    return <FundingSuccessPage />
  }
  
  if (path === '/funding-cancelled' || path === '/cancel') {
    return <FundingCancelledPage />
  }
  
  if (path === '/success') {
    return <SuccessPage />
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking your session</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <DashboardSelector />
  }

  // Show login form
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm
          onSuccess={() => setCurrentView('dashboard')}
          onSwitchToSignup={() => setCurrentView('signup')}
        />
      </div>
    )
  }

  // Show signup form
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SignupForm
          onSuccess={() => setCurrentView('dashboard')}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      </div>
    )
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateToLogin={() => setCurrentView('login')} />
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App