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
import { SupabaseConnectionBanner } from './SupabaseConnectionBanner'
import { supabaseClient } from '../lib/supabase-client'
import { DeploymentCheck } from './DeploymentCheck'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
              <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function InvestmentPlatform() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null)

  // Check Supabase connection on mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.log('❌ Supabase environment variables missing')
          setSupabaseConnected(false)
          return
        }
        
        // Test connection with a simple query
        await supabaseClient.from('users').select('count').limit(1)
        console.log('✅ Supabase connection verified')
        setSupabaseConnected(true)
      } catch (error) {
        console.log('❌ Supabase connection failed:', error)
        setSupabaseConnected(false)
      }
    }
    
    checkSupabaseConnection()
  }, [])

  // Check for success/cancel pages
  const isSuccessPage = window.location.pathname === '/success' || window.location.search.includes('session_id')
  const isCancelPage = window.location.pathname === '/cancel'
  const isTestPage = window.location.search.includes('test=true') || window.location.hash.includes('test')

  // Show system test page
  if (isTestPage) {
    return <SystemStatusCheck />
  }

  // Show deployment check page
  const isDeploymentCheck = window.location.search.includes('deployment=check')
  if (isDeploymentCheck) {
    return <DeploymentCheck />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <div className="text-navy-900 text-lg font-medium">Loading...</div>
          {supabaseConnected === false && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Supabase not connected. Using localStorage for demo.
                Click "Connect to Supabase" in the top right for cross-device login.
              </p>
            </div>
          )}
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