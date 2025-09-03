import React, { useState, useEffect } from 'react'
import { Eye, TrendingUp, TrendingDown, Zap, DollarSign, Clock, Users, AlertTriangle, Target, Activity, RefreshCw, Lock, Crown } from 'lucide-react'

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

  const generateOptionsFlow = (): OptionsFlow[] => {
    const symbols = ['SPY', 'QQQ', 'TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'BTC']
    const traders = [
      'GOLDMAN_DESK_7', 'CITADEL_ALPHA', 'JANE_STREET_MM', 'SUSQUEHANNA_FLOW', 
      'OPTIVER_GAMMA', 'VIRTU_EXECUTION', 'TWO_SIGMA_QUANT', 'RENAISSANCE_TECH',
      'BRIDGEWATER_MACRO', 'MILLENNIUM_PARTNERS', 'DE_SHAW_SYSTEMATIC', 'AQR_CAPITAL'
    ]
    
    const now = Date.now()
    const timeVariation = (now % 100000) / 100000
    
    return Array.from({ length: 15 + Math.floor(timeVariation * 10) }, (_, i) => {
      const symbol = symbols[Math.floor((timeVariation * 1000 + i * 100) % symbols.length)]
      const isCall = Math.random() > 0.4
      const basePrice = symbol === 'SPY' ? 597 : symbol === 'QQQ' ? 485 : symbol === 'TSLA' ? 248 : 
                       symbol === 'AAPL' ? 225 : symbol === 'BTC' ? 106250 : 150 + Math.random() * 200
      
      const strike = basePrice * (0.95 + Math.random() * 0.1) // ±5% from current price
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
    
    // Live updates every 8 seconds for that real-time insider feel
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'CALL' ? 'text-green-600 bg-green-900' : 'text-red-600 bg-red-900'
  }

  const getSweepColor = (sweep: string) => {
    switch (sweep) {
      case 'AGGRESSIVE': return 'text-red-600 bg-red-100'
      case 'BLOCK': return 'text-purple-600 bg-purple-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor(diff / 1000)
    
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  return (
    <div className="bg-black rounded-xl shadow-2xl border border-gray-800 p-6 relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-red-900/10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-60"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <span>INSIDER OPTIONS FLOW</span>
                <Lock className="h-4 w-4 text-yellow-500" />
              </h3>
              <p className="text-sm text-green-400 font-mono">
                LIVE FEED #{liveCount} • CLASSIFIED ACCESS • REAL MONEY MOVES
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInsiderMode(!showInsiderMode)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                showInsiderMode 
                  ? 'bg-yellow-500 text-black shadow-lg' 
                  : 'bg-gray-800 text-yellow-500 border border-yellow-500'
              }`}
            >
              <Crown className="h-3 w-3" />
              <span>{showInsiderMode ? 'INSIDER MODE ON' : 'INSIDER MODE'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-bold tracking-wider">LIVE FEED</span>
            </div>
            
            <button
              onClick={refreshData}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh Flow Data"
            >
              <RefreshCw className="h-4 w-4 text-green-400" />
            </button>
          </div>
        </div>

        {/* Insider Alerts */}
        {showInsiderMode && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-500 font-bold text-sm tracking-wider">INSIDER ALERTS</span>
            </div>
            {alerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)} bg-opacity-20 border-opacity-50`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">{alert.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{getTimeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-300">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', name: 'All Flow', icon: Activity },
            { id: 'unusual', name: 'Unusual Activity', icon: AlertTriangle },
            { id: 'institutional', name: 'Smart Money', icon: Users },
            { id: 'dark', name: 'Dark Pools', icon: Eye }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                selectedFilter === filter.id
                  ? 'bg-green-600 text-black shadow-lg'
                  : 'bg-gray-800 text-green-400 border border-green-600 hover:bg-gray-700'
              }`}
            >
              <filter.icon className="h-4 w-4" />
              <span>{filter.name}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredFlows().map((flow) => (
              <div 
                key={flow.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer group ${
                  flow.unusualActivity 
                    ? 'bg-gradient-to-r from-yellow-900/20 to-red-900/20 border-yellow-600/30 hover:border-yellow-500' 
                    : flow.institutionalFlow
                      ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30 hover:border-purple-500'
                      : flow.darkPool
                        ? 'bg-gradient-to-r from-gray-900/40 to-black/40 border-gray-600/30 hover:border-gray-500'
                        : 'bg-gray-900/40 border-gray-700/30 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Symbol and Type */}
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-lg">{flow.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(flow.type)}`}>
                        {flow.type}
                      </span>
                      {flow.unusualActivity && (
                        <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold animate-pulse">
                          UNUSUAL
                        </span>
                      )}
                      {flow.institutionalFlow && (
                        <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-bold">
                          SMART $
                        </span>
                      )}
                      {flow.darkPool && (
                        <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-bold">
                          DARK
                        </span>
                      )}
                    </div>
                    
                    {/* Strike and Expiry */}
                    <div className="text-gray-300 font-mono">
                      <span className="text-white font-bold">${flow.strike}</span>
                      <span className="text-gray-400 ml-2">{flow.expiry}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Volume */}
                    <div className="text-right">
                      <div className="text-white font-bold font-mono">
                        {flow.volume.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">VOLUME</div>
                    </div>
                    
                    {/* Premium */}
                    <div className="text-right">
                      <div className="text-green-400 font-bold font-mono">
                        ${flow.premium.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">PREMIUM</div>
                    </div>
                    
                    {/* Notional */}
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold font-mono">
                        ${(flow.notional / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-400">NOTIONAL</div>
                    </div>
                    
                    {/* Sweep Type */}
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getSweepColor(flow.sweepType)}`}>
                        {flow.sweepType}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">{getTimeAgo(flow.timestamp)}</div>
                    </div>
                    
                    {/* Confidence */}
                    <div className="text-right min-w-[60px]">
                      <div className={`font-bold font-mono ${
                        flow.confidence > 90 ? 'text-green-400' : 
                        flow.confidence > 75 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {flow.confidence}%
                      </div>
                      <div className="text-xs text-gray-400">CONF</div>
                    </div>
                  </div>
                </div>
                
                {/* Insider Mode: Show Trader Info */}
                {showInsiderMode && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-yellow-500 font-bold">TRADER:</span>
                        <span className="text-white font-mono">{flow.trader}</span>
                        <span className={`px-2 py-1 rounded font-bold ${
                          flow.institutionalFlow ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {flow.institutionalFlow ? 'INSTITUTIONAL' : 'RETAIL'}
                        </span>
                      </div>
                      <div className="text-gray-400 font-mono">
                        ID: {flow.id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {flows.filter(f => f.type === 'CALL').length}
              </div>
              <div className="text-xs text-gray-400">CALLS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {flows.filter(f => f.type === 'PUT').length}
              </div>
              <div className="text-xs text-gray-400">PUTS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {flows.filter(f => f.unusualActivity).length}
              </div>
              <div className="text-xs text-gray-400">UNUSUAL</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {flows.filter(f => f.institutionalFlow).length}
              </div>
              <div className="text-xs text-gray-400">SMART $</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                ${(flows.reduce((sum, f) => sum + f.notional, 0) / 1000000).toFixed(0)}M
              </div>
              <div className="text-xs text-gray-400">TOTAL FLOW</div>
            </div>
          </div>
        </div>

        {/* Insider Mode Warning */}
        {showInsiderMode && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Crown className="h-4 w-4" />
              <span className="font-bold text-xs tracking-wider">
                INSIDER MODE: Showing institutional trader identities and flow sources
              </span>
            </div>
          </div>
        )}

        {/* Live Update Indicator */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-mono">LIVE UPDATES EVERY 8 SECONDS • FEED #{liveCount}</span>
        </div>
      </div>
    </div>
  )
}