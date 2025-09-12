import React from 'react'
import { Download, X, Smartphone, TrendingUp } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export function PWAInstallBanner() {
  const { showInstallBanner, installApp, dismissInstallBanner, isStandalone } = usePWA()

  // Don't show if already installed or not installable
  if (!showInstallBanner || isStandalone) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      console.log('✅ App installed successfully')
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-navy-600 to-blue-600 text-white rounded-xl shadow-2xl border border-navy-500 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M20 80 L35 65 L50 50 L65 35 L80 20" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M20 20 L35 35 L50 50 L65 65 L80 80" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M70 20 L80 20 L80 30" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M70 80 L80 80 L80 70" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">
              Install GMC App
            </h3>
            <p className="text-sm text-blue-100 mb-3">
              Get faster access to your portfolio with our mobile app
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="bg-white text-navy-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </button>
              
              <button
                onClick={dismissInstallBanner}
                className="text-blue-200 hover:text-white transition-colors p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center space-x-4 text-xs text-blue-200">
          <div className="flex items-center space-x-1">
            <Smartphone className="h-3 w-3" />
            <span>Works offline</span>
          </div>
          <span>•</span>
          <span>Push notifications</span>
          <span>•</span>
          <span>Home screen access</span>
        </div>
      </div>
    </div>
  )
}