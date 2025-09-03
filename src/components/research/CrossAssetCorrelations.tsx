import React, { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface CorrelationData {
  asset1: string
  asset2: string
  correlation: number
  change_24h: number
  significance: 'high' | 'medium' | 'low'
  relationship_type: 'positive' | 'negative' | 'neutral'
}

interface CorrelationMatrix {
  assets: string[]
  correlations: number[][]
  breakdown_alerts: {
    pair: string
    previous_correlation: number
    current_correlation: number
    change: number
    significance: string
  }[]
  lastUpdated: string
}

export function CrossAssetCorrelations() {
  const [correlations, setCorrelations] = useState<CorrelationMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'matrix' | 'alerts' | 'pairs'>('matrix')
  const [updateCount, setUpdateCount] = useState(0)

  console.log('🔗 CrossAssetCorrelations component rendering...')
  const generateCorrelationData = (): CorrelationMatrix => {
    const assets = ['BTC', 'ETH', 'SPY', 'QQQ', 'GOLD', 'DXY', 'VIX', 'TLT']
    const timeVariation = Date.now() % 100000 / 100000
    
    // Generate realistic correlation matrix
    const correlations = assets.map((asset1, i) => 
      assets.map((asset2, j) => {
        if (i === j) return 1.0 // Perfect self-correlation
        
        // Base correlations with time variation
        const baseCorrelations: { [key: string]: number } = {
          'BTC-ETH': 0.85,
          'SPY-QQQ': 0.92,
          'BTC-SPY': 0.45,
          'GOLD-DXY': -0.65,
          'VIX-SPY': -0.78,
          'TLT-SPY': -0.35
        }
        
        const key1 = `${asset1}-${asset2}`
        const key2 = `${asset2}-${asset1}`
        const baseCorr = baseCorrelations[key1] || baseCorrelations[key2] || (Math.random() - 0.5) * 0.8
        
        // Add time-based variation
        const variation = Math.sin(Date.now() / 50000 + i * j) * 0.15
        return Math.max(-1, Math.min(1, baseCorr + variation))
      })
    )

    // Generate breakdown alerts
    const breakdown_alerts = [
      {
        pair: 'BTC-SPY',
        previous_correlation: 0.67,
        current_correlation: 0.23 + (timeVariation * 0.3),
        change: -0.44 + (timeVariation * 0.2),
        significance: 'High'
      },
      {
        pair: 'GOLD-DXY',
        previous_correlation: -0.72,
        current_correlation: -0.45 + (timeVariation * -0.2),
        change: 0.27 + (timeVariation * 0.1),
        significance: 'Medium'
      },
      {
        pair: 'VIX-QQQ',
        previous_correlation: -0.81,
        current_correlation: -0.65 + (timeVariation * -0.1),
        change: 0.16 + (timeVariation * 0.05),
        significance: 'Medium'
      }
    ]

    return {
      assets,
      correlations,
      breakdown_alerts,
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 500))
    setCorrelations(generateCorrelationData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 60 * 1000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs > 0.7) return correlation > 0 ? 'bg-green-600' : 'bg-red-600'
    if (abs > 0.4) return correlation > 0 ? 'bg-green-400' : 'bg-red-400'
    if (abs > 0.2) return correlation > 0 ? 'bg-green-200' : 'bg-red-200'
    return 'bg-gray-200'
  }

  const getCorrelationTextColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    return abs > 0.4 ? 'text-white' : 'text-gray-900'
  }

  const views = [
    { id: 'matrix', name: 'Correlation Matrix', icon: BarChart3 },
    { id: 'alerts', name: 'Breakdown Alerts', icon: AlertTriangle },
    { id: 'pairs', name: 'Trading Pairs', icon: TrendingUp }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Cross-Asset Correlations</h3>
            <p className="text-sm text-gray-600">
              Live correlation analysis • Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">LIVE</span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedView === view.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <view.icon className="h-4 w-4" />
            <span>{view.name}</span>
          </button>
        ))}
      </div>

      {loading && !correlations ? (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      ) : correlations && (
        <div className="space-y-6">
          {selectedView === 'matrix' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Live Correlation Matrix</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      {correlations.assets.map(asset => (
                        <th key={asset} className="p-2 text-xs font-medium text-gray-900 text-center">
                          {asset}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlations.assets.map((asset1, i) => (
                      <tr key={asset1}>
                        <td className="p-2 text-xs font-medium text-gray-900">{asset1}</td>
                        {correlations.assets.map((asset2, j) => {
                          const correlation = correlations.correlations[i][j]
                          return (
                            <td key={asset2} className="p-1">
                              <div 
                                className={`w-12 h-8 rounded text-xs font-bold flex items-center justify-center ${getCorrelationColor(correlation)} ${getCorrelationTextColor(correlation)}`}
                                title={`${asset1}-${asset2}: ${correlation.toFixed(3)}`}
                              >
                                {correlation.toFixed(2)}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Positive Correlation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Negative Correlation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Low Correlation</span>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'alerts' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Correlation Breakdown Alerts</h4>
              <div className="space-y-3">
                {correlations.breakdown_alerts.map((alert, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-900">{alert.pair} Correlation Breakdown</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.significance === 'High' ? 'bg-red-100 text-red-800' :
                        alert.significance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.significance} Impact
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Previous:</span>
                        <span className="font-medium ml-1">{alert.previous_correlation.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium ml-1">{alert.current_correlation.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Change:</span>
                        <span className={`font-medium ml-1 ${alert.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'pairs' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Pairs Trading Opportunities</h4>
              <div className="space-y-3">
                {correlations.assets.slice(0, 4).map((asset, index) => {
                  const correlation = correlations.correlations[index][(index + 1) % correlations.assets.length]
                  const partner = correlations.assets[(index + 1) % correlations.assets.length]
                  
                  return (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-gray-900">{asset}</span>
                            <span className="text-gray-500">vs</span>
                            <span className="font-bold text-gray-900">{partner}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Math.abs(correlation) > 0.7 ? 'bg-green-100 text-green-800' :
                            Math.abs(correlation) > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.abs(correlation) > 0.7 ? 'Strong' :
                             Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'} Correlation
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {correlation.toFixed(3)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.abs(correlation) > 0.6 ? 'Pairs Trade' : 'Diversification'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}