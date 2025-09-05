import React, { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}

function AuthenticatedApp({ onBackToHome }: AuthenticatedAppProps) {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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