import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginForm } from './auth/LoginForm'
import { SignupForm } from './auth/SignupForm'
import { DashboardSelector } from './DashboardSelector'
import { Loader2 } from 'lucide-react'

interface AuthenticatedAppProps {
  onBackToHome?: () => void
}
            onSuccess={() => {}}
            onSwitchToLogin={() => setShowSignup(false)}
            onBackToHome={onBackToHome}
  if (loading) {
        )}
      </div>
    )
  }

  if (!user) {
}

interface InvestmentPlatformProps {
  onBackToHome?: () => void
            onSuccess={() => {}}
    <AuthProvider>
      <AuthenticatedApp onBackToHome={onBackToHome} />
    </AuthProvider>
  )
}