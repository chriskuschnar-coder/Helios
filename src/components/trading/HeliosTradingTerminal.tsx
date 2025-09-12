import React, { useState } from 'react'
import { ExternalLink, Zap, Activity, ArrowRight, Loader2, Monitor, Shield, TrendingUp } from 'lucide-react'

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({ isFullscreen = false }: HeliosTradingTerminalProps) {
  const [loading, setLoading] = useState(false)

  const handleEnterTerminal = () => {
    setLoading(true)
    
    // Show loading state for smooth UX
    setTimeout(() => {
      console.log('🚀 Opening Helios Trading Terminal in new tab')
      window.open('https://helios.luminarygrow.com/', '_blank', 'noopener,noreferrer')
      setLoading(false)
    }, 1500) // 1.5 second loading for smooth transition
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Terminal Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Monitor className="h-12 w-12 text-white" />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Helios Trading Terminal
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            You're about to access the Helios Trading Terminal, our advanced trading platform 
            with real-time market data, professional charting tools, and institutional-grade execution.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Market Data</h3>
              <p className="text-sm text-gray-600">Real-time quotes and advanced charting</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Execution</h3>
              <p className="text-sm text-gray-600">Institutional-grade order management</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Tools</h3>
              <p className="text-sm text-gray-600">Professional trading indicators</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Secure Trading Environment</span>
            </div>
            <p className="text-sm text-blue-800">
              The terminal will open in a new tab with encrypted connections and secure authentication. 
              Your Global Markets Consulting session remains active in this tab.
            </p>
          </div>

          {/* Enter Terminal Button */}
          <button
            onClick={handleEnterTerminal}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 inline-flex items-center space-x-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Opening Terminal...</span>
              </>
            ) : (
              <>
                <Monitor className="w-6 h-6" />
                <span>Enter Terminal</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {loading && (
            <div className="mt-4 text-sm text-gray-600">
              Launching Helios Trading Terminal in a new tab...
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            The terminal opens in a new tab for optimal performance and security
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Connection</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-Time Data</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Professional Tools</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}