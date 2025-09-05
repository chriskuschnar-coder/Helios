import React, { useState, useEffect } from 'react'
import { ExternalLink, Maximize2, RefreshCw, Activity, AlertCircle, TrendingUp } from 'lucide-react'

interface HeliosTerminalEmbedProps {
  userBalance: number
  onFundAccount: () => void
}

export function HeliosTerminalEmbed({ userBalance, onFundAccount }: HeliosTerminalEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setHasError(false)
    setIsLoaded(false)
    
    // Force iframe reload
    const iframe = document.getElementById('helios-terminal') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  const openDirectTerminal = () => {
    window.open('https://helios.luminarygrow.com/', '_blank', 'width=1920,height=1080,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no')
  }

  // Check if user has sufficient balance to access terminal
  const hasAccess = userBalance > 0

  if (!hasAccess) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="h-10 w-10 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Access HELIOS Trading Terminal
          </h2>
          
          <p className="text-gray-400 mb-8">
            Fund your account to access the live HELIOS trading terminal and view 
            real-time performance of the Global Market Consulting Fund.
          </p>
          
          <button
            onClick={onFundAccount}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 w-full"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Fund Account to Access Terminal</span>
          </button>
          
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2">HELIOS Terminal Features:</h3>
            <ul className="text-sm text-gray-400 space-y-1 text-left">
              <li>• Live fund trading positions</li>
              <li>• Real-time P&L and performance metrics</li>
              <li>• Professional trading analytics</li>
              <li>• Market data and charts</li>
              <li>• Risk management dashboard</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <a
              href="https://helios.luminarygrow.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center space-x-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Preview Terminal (Read-Only)</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Terminal Controls */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">HELIOS Trading Terminal</span>
            </div>
            <div className="text-sm text-gray-400">
              Global Market Consulting Fund • Live Data
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">
              Your Investment: <span className="text-white font-medium">${userBalance.toLocaleString()}</span>
            </div>
            
            <button
              onClick={handleRetry}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title="Refresh Terminal"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={openDirectTerminal}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title="Open in New Window"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <a
              href="https://helios.luminarygrow.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              title="Direct Link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="relative">
        <iframe
          id="helios-terminal"
          src="https://helios.luminarygrow.com/"
          className="w-full h-[800px] border-0"
          title="HELIOS Trading Terminal - Global Market Consulting Fund"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          allow="fullscreen"
        />
        
        {/* Loading State */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <div className="text-white font-medium">Loading HELIOS Terminal...</div>
              <div className="text-gray-400 text-sm mt-2">
                Connecting to live trading system • Attempt {retryCount + 1}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
              
              <h3 className="text-xl font-bold text-white mb-4">
                Terminal Connection Issue
              </h3>
              
              <p className="text-gray-400 mb-6">
                The HELIOS terminal couldn't load in the embedded view. This might be due to 
                security restrictions. You can access the terminal directly:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={openDirectTerminal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Maximize2 className="h-5 w-5" />
                  <span>Open HELIOS in New Window</span>
                </button>
                
                <a
                  href="https://helios.luminarygrow.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Direct Link to HELIOS</span>
                </a>
                
                <button
                  onClick={handleRetry}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Embedding Again</span>
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                Some browsers block embedded content for security. The direct link always works.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Info Footer */}
      <div className="bg-gray-900 px-4 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Fund AUM: $4.2M</span>
            <span>Your Share: {((userBalance / 4200000) * 100).toFixed(3)}%</span>
            <span>Status: Live Trading</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to HELIOS</span>
          </div>
        </div>
      </div>
    </div>
  )
}