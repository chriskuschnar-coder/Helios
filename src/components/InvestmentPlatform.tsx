import React from 'react'
import { AuthProvider } from './auth/AuthProvider'

interface InvestmentPlatformProps {
  onBackToHome: () => void
}

export function InvestmentPlatform({ onBackToHome }: InvestmentPlatformProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Investment platform content will go here */}
        <div className="p-4">
          <button 
            onClick={onBackToHome}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
          <h1 className="text-2xl font-bold">Investment Platform</h1>
          <p className="mt-2 text-gray-600">Platform content coming soon...</p>
        </div>
      </div>
    </AuthProvider>
  )
}