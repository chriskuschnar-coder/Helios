import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'
import { Hero } from './Hero'
import { About } from './About'
import { Services } from './Services'
import { Performance } from './Performance'
import { Contact } from './Contact'
import { Header } from './Header'
import { Footer } from './Footer'

export function InvestmentPlatform() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <div className="text-navy-900 text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
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