import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import DashboardSelector from './DashboardSelector'
import { Loader2 } from 'lucide-react'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}

function AuthenticatedApp({ onBackToHome }: AuthenticatedAppProps) {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [forceShowAuth, setForceShowAuth] = useState(false)
  const [authTimeout, setAuthTimeout] = useState(false)
  const [error, setError] = useState('')

  // Prevent infinite loading with shorter timeout
  useEffect(() => {
    try {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('Auth loading timeout - showing login forms')
        setForceShowAuth(true)
        setAuthTimeout(true)
      }, 1500) // Even shorter timeout
      
      return () => clearTimeout(timeout)
    }
    } catch (err) {
      console.error('❌ Auth timeout setup error:', err);
      setError('Authentication setup failed');
    }
  }, [loading])

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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
              try {
              setForceShowAuth(false)
              setAuthTimeout(false)
              } catch (err) {
                console.error('❌ Signup success handler error:', err);
                setError('Login transition failed');
              }
            }}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
          />
        ) : (
          <LoginForm 
            onSuccess={() => {
              try {
              setForceShowAuth(false)
              setAuthTimeout(false)
              } catch (err) {
                console.error('❌ Login success handler error:', err);
                setError('Login transition failed');
              }
            }}
            onSwitchToSignup={() => setShowSignup(true)}
            onBackToHome={onBackToHome}
          />
        )}
      </div>
    )
  }

  try {
    return <DashboardSelector />
  } catch (err) {
    console.error('❌ Dashboard render error:', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">Failed to load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

interface InvestmentPlatformProps {
  onBackToHome?: () => void
}

export function InvestmentPlatform({ onBackToHome }: InvestmentPlatformProps) {
  try {
    return (
      <AuthProvider>
        <AuthenticatedApp onBackToHome={onBackToHome} />
      </AuthProvider>
    )
  } catch (err) {
    console.error('❌ Investment platform error:', err);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Error</h3>
          <p className="text-gray-600 mb-4">Failed to initialize investment platform</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}