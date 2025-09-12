import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, Maximize2, Minimize2, RefreshCw } from 'lucide-react'

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({ isFullscreen = false }: HeliosTradingTerminalProps) {
  const [mt5Data, setMT5Data] = useState<MT5Data | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'signals' | 'analytics'>('overview')
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showSensitiveData, setShowSensitiveData] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate realistic MT5 data
  const generateMT5Data = (): MT5Data => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.02
    const baseEquity = 250000
    const currentEquity = baseEquity * (1 + timeVariation)
    
    return {
      account_number: '12345678',
      balance: baseEquity,
      equity: currentEquity,
      margin: currentEquity * 0.15,
      free_margin: currentEquity * 0.85,
      profit: currentEquity - baseEquity,
      positions_count: Math.floor(Math.random() * 8) + 2,
      timestamp: new Date().toISOString()
    }
  }

  // Generate realistic trading positions
  const generatePositions = (): Position[] => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY']
    const timeVariation = Date.now() % 100000 / 100000
    
    return symbols.slice(0, 3 + Math.floor(timeVariation * 5)).map((symbol, index) => {
      const isLong = Math.random() > 0.5
      const openPrice = 1.0500 + (Math.random() * 0.2)
      const currentPrice = openPrice + ((Math.random() - 0.5) * 0.01)
      const volume = (Math.random() * 2 + 0.1).toFixed(2)
      const profit = (currentPrice - openPrice) * parseFloat(volume) * 100000 * (isLong ? 1 : -1)
      
      return {
        ticket: 1000000 + index,
        symbol,
        type: isLong ? 'buy' : 'sell',
        volume: parseFloat(volume),
        open_price: openPrice,
        current_price: currentPrice,
        profit: profit,
        swap: Math.random() * 10 - 5,
        commission: Math.random() * 5,
        comment: 'Helios AI Signal',
        open_time: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    })
  }

  // Generate AI trading signals
  const generateSignals = (): TradingSignal[] => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'SPX500']
    const actions = ['buy', 'sell', 'close'] as const
    const timeVariation = Date.now() % 100000 / 100000
    
    return symbols.slice(0, 2 + Math.floor(timeVariation * 3)).map((symbol, index) => {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const confidence = 75 + Math.random() * 20
      const entryPrice = 1.0500 + (Math.random() * 0.2)
      
      return {
        id: `signal-${index}-${Date.now()}`,
        symbol,
        action,
        confidence: Math.floor(confidence),
        entry_price: entryPrice,
        stop_loss: entryPrice * (action === 'buy' ? 0.995 : 1.005),
        take_profit: entryPrice * (action === 'buy' ? 1.01 : 0.99),
        risk_reward: 2.0 + Math.random(),
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: Math.random() > 0.7 ? 'executed' : Math.random() > 0.3 ? 'pending' : 'cancelled',
        reasoning: `AI detected ${confidence.toFixed(0)}% probability ${action} signal based on momentum analysis and market microstructure patterns.`
      }
    })
  }

  const refreshData = async () => {
    try {
      setLoading(true)
      setLastUpdate(new Date())
      
      // Simulate API calls to MT5 system
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMT5Data(generateMT5Data())
      setPositions(generatePositions())
      setSignals(generateSignals())
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to refresh trading data:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshData, 5000) // Update every 5 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
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
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              <ExternalLink className="w-8 h-8 text-white" />
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