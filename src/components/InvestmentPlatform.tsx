import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'
import { SuccessPage } from './SuccessPage'
import { CancelPage } from './CancelPage'
import { Hero } from './Hero'
import { About } from './About'
import { Services } from './Services'
import { Performance } from './Performance'
import { Contact } from './Contact'
import { Header } from './Header'
import { Footer } from './Footer'
import { SystemStatusCheck } from './SystemStatusCheck'

export function InvestmentPlatform() {
  const { user, loading, connectionError } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  // Check for success/cancel pages
  const isSuccessPage = window.location.pathname === '/success' || window.location.search.includes('session_id')
  const isCancelPage = window.location.pathname === '/cancel'
  const isTestPage = window.location.search.includes('test=true') || window.location.hash.includes('test')

  // Show system test page
  if (isTestPage) {
    return <SystemStatusCheck />
  }

  // Show connection error if Supabase isn't working
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-red-600 text-2xl">⚠️</div>
          </div>
          <h1 className="font-serif text-xl font-bold text-gray-900 mb-4">
            Database Connection Error
          </h1>
          <p className="text-gray-600 mb-6">
            {connectionError}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
              <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Not set'}</div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <div className="text-navy-900 text-lg font-medium">Loading...</div>
          <div className="text-gray-600 text-sm mt-2">Connecting to database...</div>
        </div>
      </div>
    )
  }

  // Show success page
  if (isSuccessPage) {
    return <SuccessPage />
  }

  // Show cancel page
  if (isCancelPage) {
    return <CancelPage />
  }

  // If user is authenticated, show dashboard selector
  if (user) {
    return <DashboardSelector />
  }

  // If showing auth forms
  if (authMode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <LoginForm
          onSuccess={() => setAuthMode(null)}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
        <button
          onClick={() => setAuthMode(null)}
          className="absolute top-4 left-4 text-navy-600 hover:text-navy-700 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  if (authMode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <SignupForm
          onSuccess={() => setAuthMode(null)}
          onSwitchToLogin={() => setAuthMode('login')}
        />
        <button
          onClick={() => setAuthMode(null)}
          className="absolute top-4 left-4 text-navy-600 hover:text-navy-700 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  // Default: show marketing site
  return (
    <main className="min-h-screen bg-white">
      <Header onNavigateToLogin={() => setAuthMode('login')} />
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </main>
  )
}