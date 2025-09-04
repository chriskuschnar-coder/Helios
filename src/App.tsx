import { useState } from 'react'
import { SupabaseConnectionCheck } from './components/SupabaseConnectionCheck'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'

export default function App() {
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)
  const [showConnectionCheck, setShowConnectionCheck] = useState(false)

  const handleNavigateToLogin = () => {
    setShowInvestmentPlatform(true)
  }

  // Check if we should show connection check (for debugging)
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('debug') === 'supabase') {
    return <SupabaseConnectionCheck />
  }

  if (showInvestmentPlatform) {
    return <InvestmentPlatform />
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateToLogin={handleNavigateToLogin} />
      <Hero />
      <About />
      <Services />
      <Footer />
    </div>
  )
}