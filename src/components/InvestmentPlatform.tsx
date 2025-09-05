import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'
import { Loader2 } from 'lucide-react'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}

function AuthenticatedApp({ onBackToHome }: AuthenticatedAppProps) {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [forceShowAuth, setForceShowAuth] = useState(false)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Auth loading timeout - forcing auth forms to show')
        setForceShowAuth(true)
      }, 5000) // 5 second timeout
      
      return () => clearTimeout(timeout)
    }
  }, [loading])

  if (loading && !forceShowAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-navy-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Client Portal</h3>
          <p className="text-gray-600">Connecting to your account...</p>
          <div className="mt-4 text-sm text-gray-500">
            If this takes too long, try refreshing the page
          </div>
          <button
            onClick={() => setForceShowAuth(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Continue to Login →
          </button>
        </div>
      </div>
    )
  }

  if (!user || forceShowAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={() => {
              // User will be automatically logged in after successful signup
              setForceShowAuth(false)
            }}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {
              // User will be automatically redirected to dashboard
              setForceShowAuth(false)
            }}
            onSwitchToSignup={() => setShowSignup(true)}
            onBackToHome={onBackToHome}
          />
        )}
      </div>
    )
  }

  return <DashboardSelector />
}

interface InvestmentPlatformProps {
  onBackToHome?: () => void
}

export function InvestmentPlatform({ onBackToHome }: InvestmentPlatformProps) {
  return (
    <AuthProvider>
      <AuthenticatedApp onBackToHome={onBackToHome} />
    </AuthProvider>
  )
}