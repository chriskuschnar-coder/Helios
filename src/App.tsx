import React, { useState } from 'react'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { StripeElementsProvider } from './components/StripeElementsProvider'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { DashboardSelector } from './components/DashboardSelector'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Performance } from './components/Performance'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { SuccessPage } from './components/SuccessPage'
import { CancelPage } from './components/CancelPage'
import { FundingSuccessPage } from './components/FundingSuccessPage'
import { FundingCancelledPage } from './components/FundingCancelledPage'
import { EnvCheck } from './components/EnvCheck'
import { DatabaseDiagnostic } from './components/DatabaseDiagnostic'
import { DatabaseConnectionTest } from './components/DatabaseConnectionTest'
import { SiteDiagnostics } from './components/SiteDiagnostics'

function AppContent() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  // Check URL for success/cancel pages
  const urlParams = new URLSearchParams(window.location.search)
  const isSuccessPage = urlParams.has('session_id') || window.location.pathname === '/success'
  const isCancelPage = window.location.pathname === '/cancel'
  const isFundingSuccess = window.location.pathname === '/funding-success'
  const isFundingCancelled = window.location.pathname === '/funding-cancelled'
  const isDatabaseDiagnostic = window.location.pathname === '/database-diagnostic'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show success/cancel pages
  if (isSuccessPage) return <SuccessPage />
  if (isCancelPage) return <CancelPage />
  if (isFundingSuccess) return <FundingSuccessPage />
  if (isFundingCancelled) return <FundingCancelledPage />
  if (isDatabaseDiagnostic) return <DatabaseDiagnostic />

  // Show dashboard if user is logged in
  if (user) {
    return <DashboardSelector />
  }

  // Show login/signup forms
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm 
          onSuccess={() => {
            setShowLogin(false)
            // User state will update automatically via AuthProvider
          }}
          onSwitchToSignup={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
        />
      </div>
    )
  }

  if (showSignup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SignupForm 
          onSuccess={() => {
            setShowSignup(false)
            // User state will update automatically via AuthProvider
          }}
          onSwitchToLogin={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
        />
      </div>
    )
  }

  // Show public website
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateToLogin={() => setShowLogin(true)} />
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
    <StripeElementsProvider>
      <AuthProvider>
        <EnvCheck />
        <AppContent />
      </AuthProvider>
    </StripeElementsProvider>
  )
}

export default App