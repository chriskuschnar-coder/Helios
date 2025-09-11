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
  const [forceShowAuth, setForceShowAuth] = useState(false)
  const [authTimeout, setAuthTimeout] = useState(false)

  // Prevent infinite loading with shorter timeout
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Auth loading timeout - showing login forms')
        setForceShowAuth(true)
        setAuthTimeout(true)
      }, 1500) // Even shorter timeout
      
      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Show loading only briefly, then force auth forms
  if (loading && !forceShowAuth && !authTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-navy-600 mx-auto mb-3 animate-spin" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Loading Portal</h3>
          <button
            onClick={() => setForceShowAuth(true)}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Skip to Login →
          </button>
        </div>
      </div>
    )
  }

  if (!user || forceShowAuth || authTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={() => {
              setForceShowAuth(false)
              setAuthTimeout(false)
            }}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {
              setForceShowAuth(false)
              setAuthTimeout(false)
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