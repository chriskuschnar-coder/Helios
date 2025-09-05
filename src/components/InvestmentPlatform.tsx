import React, { useState } from 'react'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-navy-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Client Portal</h3>
          <p className="text-gray-600">Connecting to your account...</p>
          <div className="mt-4 text-sm text-gray-500">
            If this takes too long, try refreshing the page
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={() => {
              // User will be automatically logged in after successful signup
            }}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {
              // User will be automatically redirected to dashboard
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