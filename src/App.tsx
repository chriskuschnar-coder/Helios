import React from 'react'
import { AuthProvider } from './components/auth/AuthProvider'
import { InvestmentPlatform } from './components/InvestmentPlatform'

function App() {
  return (
    <AuthProvider>
      <InvestmentPlatform />
    </AuthProvider>
  )
}

export default App