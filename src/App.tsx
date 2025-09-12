import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { InvestmentPlatform } from './components/InvestmentPlatform'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { PWAInstallBanner } from './components/PWAInstallBanner'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWAUpdateNotification } from './components/PWAUpdateNotification'
import { usePWA } from './hooks/usePWA'

export default function App() {
  const [showInvestmentPlatform, setShowInvestmentPlatform] = useState(false)
  const [platformLoading, setPlatformLoading] = useState(false)
  const { showInstallBanner, installApp, dismissInstallBanner, isInstallable, isStandalone } = usePWA()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [debugPWA, setDebugPWA] = useState(false)

  const handleAppUpdate = async () => {
    if (serviceWorkerRegistration?.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      return true
    }
    return false
  }

  const handleNavigateToLogin = () => {
    setPlatformLoading(true)
    // Small delay to show loading state
    setTimeout(() => {
      setPlatformLoading(false)
      setShowInvestmentPlatform(true)
    }, 500)
  }

  useEffect(() => {
    window.addEventListener('navigate-to-login', handleNavigateToLogin)
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator && 
        !window.location.hostname.includes('stackblitz') && 
        !window.location.hostname.includes('localhost') &&
        process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope)
            setServiceWorkerRegistration(registration)
            
            // Listen for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Show update notification
                    showUpdateNotification()
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error)
          })
      })
    }
    
    // Show install prompt after 30 seconds if installable
    const installTimer = setTimeout(() => {
      if (isInstallable && !isStandalone && !showInstallBanner) {
        console.log('🔍 PWA Debug: Showing install prompt after 30s timer')
        setShowInstallPrompt(true)
      }
      console.log('🔍 PWA Debug: Timer fired - isInstallable:', isInstallable, 'isStandalone:', isStandalone, 'showInstallBanner:', showInstallBanner)
    }, 30000)
    
    // Debug: Show install prompt immediately for testing
    const debugTimer = setTimeout(() => {
      if (!isStandalone) {
        console.log('🔍 PWA Debug: Force showing install prompt for testing')
        setShowInstallPrompt(true)
      }
    }, 5000) // Show after 5 seconds for testing
    
    return () => {
      window.removeEventListener('navigate-to-login', handleNavigateToLogin)
      clearTimeout(installTimer)
      clearTimeout(debugTimer)
    }
  }, [isInstallable, isStandalone, showInstallBanner])
  
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
      
      {/* PWA Install Components */}
      <PWAInstallBanner />
      <PWAInstallPrompt
        onInstall={installApp}
        onDismiss={() => setShowInstallPrompt(false)}
        isVisible={showInstallPrompt}
      />
      
      {/* Debug PWA Status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black text-white p-3 rounded-lg text-xs z-50">
          <div>PWA Debug:</div>
          <div>Installable: {isInstallable ? '✅' : '❌'}</div>
          <div>Standalone: {isStandalone ? '✅' : '❌'}</div>
          <div>Show Banner: {showInstallBanner ? '✅' : '❌'}</div>
          <div>Show Prompt: {showInstallPrompt ? '✅' : '❌'}</div>
          <button 
            onClick={() => setShowInstallPrompt(true)}
            className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
          >
            Force Show Prompt
          </button>
        </div>
      )}
      
      <PWAUpdateNotification
        isVisible={showUpdateNotification}
        onUpdate={handleAppUpdate}
        onDismiss={() => setShowUpdateNotification(false)}
      />
    </div>
  )
}