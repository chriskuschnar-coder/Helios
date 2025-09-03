import React, { useState, useEffect } from 'react'
import { Eye, TrendingUp, TrendingDown, Zap, DollarSign, Clock, Users, AlertTriangle, Target, Activity, RefreshCw, Lock, Crown, Filter } from 'lucide-react'

interface OptionsFlow {
  id: string
  timestamp: string
  symbol: string
  type: 'CALL' | 'PUT'
  strike: number
  expiry: string
  volume: number
  premium: number
  notional: number
  unusualActivity: boolean
  institutionalFlow: boolean
  confidence: number
  trader: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  darkPool: boolean
  sweepType: 'AGGRESSIVE' | 'PASSIVE' | 'BLOCK'
}

interface FlowAlert {
  id: string
  symbol: string
  message: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  type: 'unusual_volume' | 'dark_pool' | 'institutional' | 'gamma_squeeze'
}

export function OptionsFlowTracker() {
  const [flows, setFlows] = useState<OptionsFlow[]>([])
  const [alerts, setAlerts] = useState<FlowAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unusual' | 'institutional' | 'dark'>('all')
  const [liveCount, setLiveCount] = useState(0)
  const [showInsiderMode, setShowInsiderMode] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const assetsByCategory = {
    tech: [
      { symbol: 'AAPL', basePrice: 225 },
      { symbol: 'MSFT', basePrice: 415 },
      { symbol: 'NVDA', basePrice: 875 },
      { symbol: 'GOOGL', basePrice: 165 },
      { symbol: 'META', basePrice: 485 },
      { symbol: 'TSLA', basePrice: 248 },
      { symbol: 'AMZN', basePrice: 185 },
      { symbol: 'NFLX', basePrice: 485 },
      { symbol: 'CRM', basePrice: 285 },
      { symbol: 'ORCL', basePrice: 125 }
    ],
    finance: [
      { symbol: 'JPM', basePrice: 225 },
      { symbol: 'BAC', basePrice: 42 },
      { symbol: 'WFC', basePrice: 58 },
      { symbol: 'GS', basePrice: 485 },
      { symbol: 'MS', basePrice: 115 },
      { symbol: 'C', basePrice: 68 },
      { symbol: 'BRK.B', basePrice: 485 },
      { symbol: 'V', basePrice: 285 },
      { symbol: 'MA', basePrice: 485 },
      { symbol: 'AXP', basePrice: 285 }
    ],
    crypto: [
      { symbol: 'BTC', basePrice: 106250 },
      { symbol: 'ETH', basePrice: 3195 },
      { symbol: 'COIN', basePrice: 285 },
      { symbol: 'MSTR', basePrice: 385 },
      { symbol: 'RIOT', basePrice: 12 },
      { symbol: 'MARA', basePrice: 18 }
    ],
    indices: [
      { symbol: 'SPY', basePrice: 597 },
      { symbol: 'QQQ', basePrice: 485 },
      { symbol: 'IWM', basePrice: 231 },
      { symbol: 'VIX', basePrice: 18 },
      { symbol: 'DIA', basePrice: 425 },
      { symbol: 'EFA', basePrice: 85 },
      { symbol: 'EEM', basePrice: 42 }
    ]
  }

  const allAssets = Object.entries(assetsByCategory).flatMap(([category, assets]) => 
    assets.map(asset => ({ ...asset, category: category as any }))
  )

  const generateOptionsFlow = (): OptionsFlow[] => {
    return Array.from({ length: 25 }, (_, i) => {
      const asset = allAssets[Math.floor(Math.random() * allAssets.length)]
      const symbol = asset.symbol
      const basePrice = asset.basePrice
      const isCall = Math.random() > 0.45
    
      const traders = [
        'GOLDMAN_DESK_7', 'CITADEL_ALPHA', 'JANE_STREET_MM', 'SUSQUEHANNA_FLOW', 
        'OPTIVER_GAMMA', 'VIRTU_EXECUTION', 'TWO_SIGMA_QUANT', 'RENAISSANCE_TECH',
        'BRIDGEWATER_MACRO', 'MILLENNIUM_PARTNERS', 'DE_SHAW_SYSTEMATIC', 'AQR_CAPITAL'
      ]
      
      const now = Date.now()
      const timeVariation = (now % 100000) / 100000
      
      const strike = basePrice * (0.95 + Math.random() * 0.1)
      const volume = Math.floor(500 + Math.random() * 5000 + (timeVariation * 2000))
      const premium = 2 + Math.random() * 15 + (timeVariation * 5)
      const notional = volume * premium * 100
      
      const unusualActivity = Math.random() > 0.7
      const institutionalFlow = Math.random() > 0.6
      const darkPool = Math.random() > 0.8
      
      return {
        id: `flow-${i}-${now}`,
        timestamp: new Date(now - Math.random() * 3600000).toISOString(),
        symbol,
        type: isCall ? 'CALL' : 'PUT',
        strike: Math.round(strike * 100) / 100,
        expiry: ['1/31', '2/7', '2/14', '2/21', '3/21', '4/18'][Math.floor(Math.random() * 6)],
        volume,
        premium: Math.round(premium * 100) / 100,
        notional,
        unusualActivity,
        institutionalFlow,
        confidence: Math.floor(75 + Math.random() * 20 + (timeVariation * 5)),
        trader: traders[Math.floor((timeVariation * 1000 + i * 200) % traders.length)],
        sentiment: isCall ? 'bullish' : 'bearish',
        darkPool,
        sweepType: ['AGGRESSIVE', 'PASSIVE', 'BLOCK'][Math.floor(Math.random() * 3)] as any
      }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const generateFlowAlerts = (): FlowAlert[] => {
    const alertTypes = [
      {
        symbol: 'SPY',
        message: 'MASSIVE CALL SWEEP: $50M notional in Feb 14 calls. Smart money positioning for rally.',
        severity: 'high' as const,
        type: 'unusual_volume' as const
      },
      {
        symbol: 'TSLA',
        message: 'Dark pool accumulation detected: 2.5M shares traded off-exchange in last hour.',
        severity: 'high' as const,
        type: 'dark_pool' as const
      },
      {
        symbol: 'QQQ',
        message: 'Institutional PUT buying: Goldman desk loading March puts. Hedging or directional?',
        severity: 'medium' as const,
        type: 'institutional' as const
      },
      {
        symbol: 'NVDA',
        message: 'Gamma squeeze setup: 95% of open interest at $900 strike. Pin risk elevated.',
        severity: 'high' as const,
        type: 'gamma_squeeze' as const
      }
    ]

    return alertTypes.map((alert, i) => ({
      id: `alert-${i}-${Date.now()}`,
      ...alert,
      timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString()
    }))
  }

  const refreshData = () => {
    setLiveCount(prev => prev + 1)
    setFlows(generateOptionsFlow())
    setAlerts(generateFlowAlerts())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 8000)
    return () => clearInterval(interval)
  }, [])

  const getFilteredFlows = () => {
    switch (selectedFilter) {
      case 'unusual':
        return flows.filter(flow => flow.unusualActivity)
      case 'institutional':
        return flows.filter(flow => flow.institutionalFlow)
      case 'dark':
        return flows.filter(flow => flow.darkPool)
      default:
        return flows
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor(diff / 1000)
    
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  const formatNotional = (notional: number) => {
    if (notional >= 1000000) return `$${(notional / 1000000).toFixed(1)}M`
    if (notional >= 1000) return `$${(notional / 1000).toFixed(0)}K`
    return `$${notional.toFixed(0)}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Mobile-Optimized Header */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-navy-900">Options Flow</h3>
              <p className="text-xs text-gray-600">Live #{liveCount}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </button>
            
            <button
              onClick={refreshData}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Filter Dropdown */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { id: 'all', name: 'All', icon: Activity },
              { id: 'unusual', name: 'Unusual', icon: AlertTriangle },
              { id: 'institutional', name: 'Smart $', icon: Users },
              { id: 'dark', name: 'Dark', icon: Eye }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => {
                  setSelectedFilter(filter.id as any)
                  setShowFilters(false)
                }}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-navy-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <filter.icon className="h-3 w-3" />
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KuCoin-Style Mobile Flow List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getFilteredFlows().map((flow) => (
              <div 
                key={flow.id}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                {/* KuCoin-Style Row Layout */}
                <div className="flex items-center justify-between">
                  {/* Left: Symbol + Type + Tags */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="text-sm font-bold text-gray-900">{flow.symbol}</div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                          flow.type === 'CALL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {flow.type}
                        </span>
                        <span className="text-xs text-gray-500">{getTimeAgo(flow.timestamp)}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {flow.unusualActivity && (
                        <span className="text-xs px-1.5 py-0.5 bg-black text-white rounded font-bold">
                          UNU
                        </span>
                      )}
                      {flow.institutionalFlow && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-white rounded font-bold">
                          INST
                        </span>
                      )}
                      {flow.darkPool && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-900 text-white rounded font-bold">
                          DARK
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Center: Strike + Expiry */}
                  <div className="text-center px-2 flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">${flow.strike}</div>
                    <div className="text-xs text-gray-500">{flow.expiry}</div>
                  </div>
                  
                  {/* Right: Volume + Notional */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">
                      {flow.volume.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatNotional(flow.notional)}
                    </div>
                  </div>
                </div>

                {/* Mobile: Additional Details Row */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      flow.sweepType === 'AGGRESSIVE' ? 'bg-red-100 text-red-800' :
                      flow.sweepType === 'BLOCK' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.sweepType}
                    </span>
                    <span className="text-gray-500">${flow.premium}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      flow.confidence > 90 ? 'text-green-600' : 
                      flow.confidence > 75 ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {flow.confidence}%
                    </span>
                  </div>
                </div>

                {/* Insider Mode: Trader Info */}
                {showInsiderMode && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-mono">{flow.trader}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        flow.institutionalFlow ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {flow.institutionalFlow ? 'INST' : 'RETAIL'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile-Optimized Summary Footer */}
      <div className="px-3 sm:px-4 md:px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-green-600">
              {flows.filter(f => f.type === 'CALL').length}
            </div>
            <div className="text-xs text-gray-500">CALLS</div>
          </div>
          <div>
            <div className="text-sm font-bold text-red-600">
              {flows.filter(f => f.type === 'PUT').length}
            </div>
            <div className="text-xs text-gray-500">PUTS</div>
          </div>
          <div>
            <div className="text-sm font-bold text-black">
              {flows.filter(f => f.unusualActivity).length}
            </div>
            <div className="text-xs text-gray-500">UNUSUAL</div>
          </div>
        </div>
        
        {/* Insider Mode Toggle */}
        <div className="mt-3 flex items-center justify-center">
          <button
            onClick={() => setShowInsiderMode(!showInsiderMode)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              showInsiderMode 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Crown className="h-3 w-3" />
            <span>{showInsiderMode ? 'INSIDER ON' : 'Show Traders'}</span>
          </button>
        </div>

        {/* Live Update Indicator */}
        <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates • #{liveCount}</span>
        </div>
      </div>
    </div>
  )
}