import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'

export default function App() {
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)

  const handleNavigateToLogin = () => {
    setShowInvestmentPlatform(true)
  }

  const handleBackToHome = () => {
    setShowInvestmentPlatform(false)
  }

  if (showInvestmentPlatform) {
    return <InvestmentPlatform onBackToHome={handleBackToHome} />
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