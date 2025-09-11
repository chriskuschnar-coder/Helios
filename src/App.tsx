import { useState } from 'react'
import { useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)
  const [platformLoading, setPlatformLoading] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('❌ App-level error:', error)
      setAppError(error.message || 'Application error occurred')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ App-level promise rejection:', event.reason)
      setAppError(event.reason?.message || 'Application error occurred')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Show error screen instead of white screen
  if (appError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-6">{appError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setAppError(null)
                window.location.reload()
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Reload Application
            </button>
            <button
              onClick={() => {
                setAppError(null)
                setShowInvestmentPlatform(false)
                localStorage.clear()
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Reset and Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Restore platform state from localStorage on mount
  useEffect(() => {
    try {
      const savedPlatformState = localStorage.getItem('showInvestmentPlatform')
      if (savedPlatformState === 'true') {
        console.log('🔄 Restoring investment platform state from localStorage')
        setShowInvestmentPlatform(true)
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore platform state:', error)
    }
  }, [])

  // Save platform state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('showInvestmentPlatform', showInvestmentPlatform.toString())
    } catch (error) {
      console.warn('⚠️ Failed to save platform state:', error)
    }
  }, [showInvestmentPlatform])

  const handleNavigateToLogin = () => {
    try {
      console.log('🚀 Navigating to investment platform')
      setPlatformLoading(true)
      
      // Add small delay to ensure smooth transition
      setTimeout(() => {
        setShowInvestmentPlatform(true)
        setPlatformLoading(false)
      }, 500)
    } catch (error) {
      console.error('❌ Navigation error:', error)
      setAppError('Failed to navigate to platform')
      setPlatformLoading(false)
    }
  }

  useEffect(() => {
    window.addEventListener('navigate-to-login', handleNavigateToLogin)
    
    return () => {
      window.removeEventListener('navigate-to-login', handleNavigateToLogin)
    }
  }, [])
  
  const handleBackToHome = () => {
    try {
      setShowInvestmentPlatform(false)
      setPlatformLoading(false)
      localStorage.removeItem('showInvestmentPlatform')
    } catch (error) {
      console.error('❌ Back to home error:', error)
      // Force reload if there's an error
      window.location.reload()
    }
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
    try {
      return <InvestmentPlatform onBackToHome={handleBackToHome} />
    } catch (error) {
      console.error('❌ Investment platform render error:', error)
      setAppError('Failed to load investment platform')
      return null
    }
  }

  try {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigateToLogin={handleNavigateToLogin} />
        <Hero />
        <About />
        <Services />
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('❌ Home page render error:', error)
    setAppError('Failed to load home page')
    return null
  }
}