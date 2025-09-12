import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'
import { Loader2 } from 'lucide-react'
import { PWAInstallBanner } from './components/PWAInstallBanner'

export default function App() {
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)
  const [platformLoading, setPlatformLoading] = useState(false)

  const handleNavigateToLogin = () => {
    setPlatformLoading(true)
    setTimeout(() => {
      setPlatformLoading(false)
      setShowInvestmentPlatform(true)
    }, 500)
  }

  useEffect(() => {
    window.addEventListener('navigate-to-login', handleNavigateToLogin)
    return () => window.removeEventListener('navigate-to-login', handleNavigateToLogin)
  }, [])

  const handleBackToHome = () => {
    setShowInvestmentPlatform(false)
    setPlatformLoading(false)
  }

  if (platformLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-navy-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Client Portal</h3>
          <p className="text-gray-600">Initializing secure connection...</p>
        </div>
      </div>
    )
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

      {/* ✅ Show the PWA Install Banner on home page */}
      <PWAInstallBanner />
    </div>
  )
}
