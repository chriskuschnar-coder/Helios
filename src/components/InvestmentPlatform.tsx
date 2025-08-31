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
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  // Check Supabase configuration
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const isConfigured = !!(url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key')
    setSupabaseConfigured(isConfigured)
    
    if (!isConfigured) {
      console.log('⚠️ Supabase not configured:')
      console.log('URL:', url || 'Missing')
      console.log('Key:', key ? 'Present' : 'Missing')
      console.log('Please click "Connect to Supabase" button')
    }
  }, [])

  // Check for success/cancel pages
  const isSuccessPage = window.location.pathname === '/success' || window.location.search.includes('session_id')
  const isCancelPage = window.location.pathname === '/cancel'
  const isTestPage = window.location.search.includes('test=true') || window.location.hash.includes('test')

  // Show system test page
  if (isTestPage) {
    return <SystemStatusCheck />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {!supabaseConfigured ? (
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-red-600 rounded-full"></div>
            </div>
            <div className="text-red-900 text-lg font-medium mb-2">Supabase Not Connected</div>
            <div className="text-red-700 text-sm mb-4">
              Please click "Connect to Supabase" in the top right corner to set up the database connection.
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-red-900 mb-2">Required Steps:</h4>
              <ol className="text-sm text-red-700 space-y-1">
                <li>1. Click "Connect to Supabase" button</li>
                <li>2. Create or select your Supabase project</li>
                <li>3. The environment variables will be set automatically</li>
                <li>4. Authentication and database will work properly</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <div className="text-navy-900 text-lg font-medium">Loading...</div>
          </div>
        )}
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