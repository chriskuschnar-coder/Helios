import React from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { DashboardSelector } from './DashboardSelector'

interface InvestmentPlatformProps {
  onBackToHome: () => void
}

export function InvestmentPlatform({ onBackToHome }: InvestmentPlatformProps) {
  return (
    <AuthProvider>
      <DashboardSelector />
    </AuthProvider>
  )
}