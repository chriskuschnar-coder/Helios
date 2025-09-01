import React, { useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'
import { Header } from './Header'
import { Hero } from './Hero'
import { About } from './About'
import { Services } from './Services'
import { Performance } from './Performance'
import { Contact } from './Contact'
import { Footer } from './Footer'

export function InvestmentPlatform() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  console.log('🔍 InvestmentPlatform rendering:', { user: !!user, loading, showAuth })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (user) {
    console.log('✅ User authenticated, showing dashboard')
    return <DashboardSelector />
  }

  // If showing auth forms
  if (showAuth) {
    console.log('🔐 Showing auth form:', authMode)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm
            onSuccess={() => {
              console.log('✅ Login successful')
              setShowAuth(false)
            }}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={() => {
              console.log('✅ Signup successful')
              setShowAuth(false)
            }}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    )
  }

  // Show marketing site
  console.log('🌐 Showing marketing site')
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateToLogin={() => {
        console.log('🔐 Navigate to login clicked')
        setAuthMode('login')
        setShowAuth(true)
      }} />
      <Hero />
      <About />
      <Services />
      <Performance />
      <Contact />
      <Footer />
    </div>
  )
}