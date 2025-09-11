import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { TwoFactorChallenge } from './auth/TwoFactorChallenge'
import { DashboardSelector } from './DashboardSelector'
import { Loader2 } from 'lucide-react'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}

function AuthenticatedApp({ onBackToHome }: AuthenticatedAppProps) {
  const { user, loading, pending2FA, pendingAuthData, signOut } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [error, setError] = useState('')
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  console.log('🔍 AuthenticatedApp state:', {
    user: user?.email,
    loading,
    initialLoadComplete
  })

  // Mark initial load as complete after a short delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInitialLoadComplete(true)
    }, 1000)
    
    return () => clearTimeout(timeout)
  }, [])

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

  // Show loading only during initial load
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-navy-600 mx-auto mb-3 animate-spin" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Loading Portal</h3>
        </div>
      </div>
    )
  }

  // CRITICAL: Show 2FA challenge if pending2FA is true
  if (pending2FA && pendingAuthData) {
    console.log('🔐 Showing 2FA challenge - user must verify before access')
    
    return (
      <TwoFactorChallenge
        onSuccess={() => {
          console.log('✅ 2FA verification successful - user now authenticated')
          // Don't need to do anything here - AuthProvider handles the state
        }}
        onCancel={async () => {
          console.log('❌ 2FA cancelled - signing out')
          await signOut()
        }}
        userEmail={pendingAuthData.userData.email}
        userData={pendingAuthData.userData}
        session={pendingAuthData.session}
      />
    )
  }

  // Show auth forms if no user AND not pending 2FA
  if (!user && !pending2FA) {
    console.log('🔐 Showing auth forms - no authenticated user')
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <SignupForm 
            onSuccess={() => {
              try {
                console.log('✅ Signup success')
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
                console.log('🎉 Login success callback - checking for 2FA requirement')
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

  // Block access if pending 2FA (safety check)
  if (pending2FA) {
    console.log('🚫 Blocking dashboard access - 2FA verification required')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Required</h3>
          <p className="text-gray-600 mb-4">Please complete 2FA verification to continue</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  try {
    console.log('🚀 Rendering DashboardSelector for authenticated user:', user.email)
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