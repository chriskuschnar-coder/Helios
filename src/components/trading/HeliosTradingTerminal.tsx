import React, { useState, useRef, useEffect } from 'react'
import { ExternalLink, Maximize2, RefreshCw, Loader2, AlertCircle, Monitor, Zap } from 'lucide-react'

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({ isFullscreen = false }: HeliosTradingTerminalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [frameBlocked, setFrameBlocked] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    const loadTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Helios iframe loading timeout - checking for frame blocking')
        setFrameBlocked(true)
        setLoading(false)
        setError('Helios terminal may be blocked from embedding. Click "Open in New Tab" for full access.')
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(loadTimeout)
  }, [loading])

  const handleIframeLoad = () => {
    console.log('✅ Helios Trading Terminal loaded successfully')
    setLoading(false)
    setError(null)
    setFrameBlocked(false)
  }

  const handleIframeError = () => {
    console.error('❌ Helios Trading Terminal failed to load')
    setLoading(false)
    setFrameBlocked(true)
    setError('Failed to load Helios Trading Terminal. This may be due to security restrictions.')
  }

  const refreshTerminal = () => {
    if (iframeRef.current) {
      setLoading(true)
      setError(null)
      setFrameBlocked(false)
      // Force reload by changing src
      const currentSrc = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc
        }
      }, 100)
    }
  }

  const openInNewTab = () => {
    console.log('🔗 Opening Helios in new tab')
    window.open('https://helios.luminarygrow.com/', '_blank', 'noopener,noreferrer')
  }

  const redirectToHelios = () => {
    console.log('🚀 Redirecting to Helios Trading Terminal')
    // Show loading message then redirect
    setLoading(true)
    setTimeout(() => {
      window.open('https://helios.luminarygrow.com/', '_blank', 'noopener,noreferrer')
      setLoading(false)
    }, 1500)
  }

  return (
    <div className={`bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-120px)]'} flex flex-col relative`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Helios Trading Terminal</span>
          </div>
          <span className="text-sm text-gray-400">Live Trading Platform</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshTerminal}
            disabled={loading}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg transition-colors"
            title="Refresh Terminal"
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-300" />
          </button>
          
          {!isFullscreen && (
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.requestFullscreen?.()
                }
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && !frameBlocked && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Helios Trading Terminal</h3>
            <p className="text-gray-400">Connecting to live trading platform...</p>
            <div className="mt-4 text-xs text-gray-500">
              This may take a few moments to initialize
            </div>
          </div>
        </div>
      )}

      {/* Frame Blocked / Error State */}
      {(frameBlocked || error) && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Helios Trading Terminal</h3>
            <p className="text-gray-400 mb-6">
              {error || 'The trading terminal needs to open in a new tab for full functionality.'}
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={openInNewTab}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Open Trading Terminal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={refreshTerminal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Try Embed Again
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Opens in new tab with full trading functionality
            </p>
          </div>
        </div>
      )}

      {/* Helios Trading Terminal Iframe */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          ref={iframeRef}
          src="https://helios.luminarygrow.com/"
          className="w-full h-full border-none"
          title="Helios Trading Terminal"
          allowFullScreen
          allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; autoplay"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            background: '#1f2937',
            colorScheme: 'dark'
          }}
        />
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-20">
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Frame Blocked: {frameBlocked ? 'Yes' : 'No'}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}