import React from 'react'
import { AuthProvider } from './components/auth/AuthProvider'
import { InvestmentPlatform } from './components/InvestmentPlatform'

console.log("📦 App.tsx mounted")

console.log("📦 App.tsx mounted")

function App() {
  console.log("📦 App component rendering")
  
  console.log("📦 App component rendering")
  
  return (
    <AuthProvider>
      <InvestmentPlatform />
    </AuthProvider>
  )
}

export default App