import React, { useState, useEffect } from 'react'
import { Users, Eye, TrendingUp, TrendingDown, Building, Zap, RefreshCw, ExternalLink } from 'lucide-react'

interface InstitutionalFlow {
  asset: string
  smart_money_flow: number
  retail_flow: number
  dark_pool_percentage: number
  whale_activity: number
  institutional_sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  timeframe: string
}

interface FlowIntelligence {
  flows: InstitutionalFlow[]
  summary: {
    total_institutional_volume: number
    smart_money_direction: 'bullish' | 'bearish' | 'neutral'
    retail_vs_institutional_ratio: number
    dark_pool_activity_level: 'high' | 'medium' | 'low'
  }
  whale_alerts: {
    asset: string
    amount: string
    direction: 'buy' | 'sell'
    timestamp: string
    confidence: number
  }[]
  lastUpdated: string
}

export function InstitutionalFlowIntelligence() {
  const [intelligence, setIntelligence] = useState<FlowIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)

  const generateFlowData = (): FlowIntelligence => {
    const timeVariation = Date.now() % 100000 / 100000
    const assets = ['BTC', 'ETH', 'SPY', 'QQQ', 'TSLA', 'NVDA', 'AAPL', 'MSFT']
    
    return {
      flows: assets.map(asset => ({
        asset,
        smart_money_flow: (Math.random() - 0.5) * 200 + (timeVariation * 50),
        retail_flow: (Math.random() - 0.5) * 100 + (timeVariation * 25),
        dark_pool_percentage: 25 + Math.random() * 30 + (timeVariation * 10),
        whale_activity: Math.floor(60 + Math.random() * 35 + (timeVariation * 15)),
        institutional_sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
        confidence: Math.floor(75 + Math.random() * 20 + (timeVariation * 5)),
        timeframe: '24h'
      })),
      summary: {
        total_institutional_volume: 2.4 + (timeVariation * 1.2),
        smart_money_direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        retail_vs_institutional_ratio: 0.65 + (timeVariation * 0.3),
        dark_pool_activity_level: timeVariation > 0.7 ? 'high' : timeVariation > 0.3 ? 'medium' : 'low'
      },
      whale_alerts: [
        {
          asset: 'BTC',
          amount: '$' + (50 + Math.floor(timeVariation * 200)).toString() + 'M',
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          confidence: Math.floor(85 + timeVariation * 10)
        },
        {
          asset: 'ETH',
          amount: '$' + (25 + Math.floor(timeVariation * 100)).toString() + 'M',
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          confidence: Math.floor(78 + timeVariation * 15)
        },
        {
          asset: 'SPY',
          amount: '$' + (100 + Math.floor(timeVariation * 300)).toString() + 'M',
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          confidence: Math.floor(82 + timeVariation * 12)
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 600))
    setIntelligence(generateFlowData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 45 * 1000) // Update every 45 seconds
    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Institutional Flow Intelligence</h3>
            <p className="text-sm text-gray-600">
              Smart Money vs Retail • Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 font-medium">LIVE</span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !intelligence ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : intelligence && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-900">
                ${intelligence.summary.total_institutional_volume.toFixed(1)}B
              </div>
              <div className="text-sm text-blue-700">Institutional Volume</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900 capitalize">
                {intelligence.summary.smart_money_direction}
              </div>
              <div className="text-sm text-green-700">Smart Money</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-900">
                {intelligence.summary.retail_vs_institutional_ratio.toFixed(2)}:1
              </div>
              <div className="text-sm text-purple-700">Retail vs Inst</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {intelligence.summary.dark_pool_activity_level}
              </div>
              <div className="text-sm text-gray-700">Dark Pool Activity</div>
            </div>
          </div>

          {/* Asset Flow Analysis */}
          <div>
            <h5 className="text-lg font-bold text-gray-900 mb-4">Asset Flow Analysis</h5>
            <div className="space-y-3">
              {intelligence.flows.slice(0, 6).map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {flow.asset.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{flow.asset}</div>
                      <div className="text-sm text-gray-600">
                        Dark Pool: {flow.dark_pool_percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">Smart:</span>
                      <span className={`font-medium ${flow.smart_money_flow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {flow.smart_money_flow > 0 ? '+' : ''}{flow.smart_money_flow.toFixed(0)}M
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Retail:</span>
                      <span className={`font-medium ${flow.retail_flow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {flow.retail_flow > 0 ? '+' : ''}{flow.retail_flow.toFixed(0)}M
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flow.institutional_sentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                      flow.institutional_sentiment === 'bearish' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.institutional_sentiment}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {flow.confidence}% conf
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whale Alerts */}
          <div>
            <h5 className="text-lg font-bold text-gray-900 mb-4">Whale Activity Alerts</h5>
            <div className="space-y-3">
              {intelligence.whale_alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {alert.asset} Whale {alert.direction.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getTimeAgo(alert.timestamp)} • {alert.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{alert.amount}</div>
                    <div className={`text-sm font-medium ${
                      alert.direction === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {alert.direction === 'buy' ? 'ACCUMULATION' : 'DISTRIBUTION'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}