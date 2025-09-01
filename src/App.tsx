import React, { useState } from 'react'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { DashboardSelector } from './components/DashboardSelector'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Performance } from './components/Performance'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { SuccessPage } from './components/SuccessPage'
import { CancelPage } from './components/CancelPage'
import { FundingSuccessPage } from './components/FundingSuccessPage'
import { FundingCancelledPage } from './components/FundingCancelledPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  // Check URL for success/cancel pages
  const urlParams = new URLSearchParams(window.location.search)
  const isSuccessPage = urlParams.has('session_id') || window.location.pathname === '/success'
  const isCancelPage = window.location.pathname === '/cancel'
  const isFundingSuccess = urlParams.has('session_id') && urlParams.has('amount')
  const isFundingCancelled = window.location.pathname === '/funding-cancelled'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Initializing your investment platform</p>
        </div>
      </div>
    )
  }

  // Handle success/cancel pages
  if (isSuccessPage && isFundingSuccess) {
    return <FundingSuccessPage />
  }
  
  if (isSuccessPage) {
    return <SuccessPage />
  }
  
  if (isCancelPage) {
    return <CancelPage />
  }
  
  if (isFundingCancelled) {
    return <FundingCancelledPage />
  }

  // If user is logged in, show dashboard
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
            // User will be automatically redirected to dashboard by AuthProvider
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
            // User will be automatically redirected to dashboard by AuthProvider
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}