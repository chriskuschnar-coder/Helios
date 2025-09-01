import React from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { DashboardSelector } from './DashboardSelector'

export function InvestmentPlatform() {
  return (
    <AuthProvider>
      <DashboardSelector />
    </AuthProvider>
  )
}