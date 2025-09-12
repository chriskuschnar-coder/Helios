import React, { useState, useRef } from 'react'
import { ExternalLink, Maximize2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({ isFullscreen = false }: HeliosTradingTerminalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleIframeLoad = () => {
    console.log('✅ Helios Trading Terminal loaded successfully')
    setLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    console.error('❌ Helios Trading Terminal failed to load')
    setLoading(false)
    setError('Failed to load Helios Trading Terminal. Please check your internet connection.')
  }

  const refreshTerminal = () => {
    if (iframeRef.current) {
      setLoading(true)
      setError(null)
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const openInNewTab = () => {
    window.open('https://helios.luminarygrow.com/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-120px)]'} flex flex-col`}>
      {/* Terminal Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Live Trading Terminal</span>
          </div>
          <span className="text-sm text-gray-400">Helios Platform</span>
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
      {loading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Loading Helios Trading Terminal</h3>
            <p className="text-gray-400">Connecting to live trading platform...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={refreshTerminal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={openInNewTab}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helios Trading Terminal Iframe */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src="https://helios.luminarygrow.com/"
          className="w-full h-full border-none"
          title="Helios Trading Terminal"
          allowFullScreen
          allow="camera; microphone; geolocation; payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            background: '#1f2937'
          }}
        />
      </div>
    </div>
  )
}