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

  // Show loading only briefly, then force auth forms
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-navy-600 mx-auto mb-3 animate-spin" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Loading Portal</h3>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={() => {}}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {}}
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