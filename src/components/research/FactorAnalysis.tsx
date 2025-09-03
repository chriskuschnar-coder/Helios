import React, { useState, useEffect } from 'react'
import { Target, RefreshCw, TrendingUp, BarChart3, Activity, Zap } from 'lucide-react'

interface FactorData {
  factor: string
  current_loading: number
  performance_1m: number
  performance_3m: number
  performance_ytd: number
  sharpe_ratio: number
  volatility: number
  status: 'outperforming' | 'underperforming' | 'neutral'
  description: string
}

interface FactorAnalysis {
  factors: FactorData[]
  portfolio_attribution: {
    factor: string
    contribution: number
    weight: number
  }[]
  factor_rotation_signal: {
    from_factor: string
    to_factor: string
    strength: number
    timeframe: string
  }
  lastUpdated: string
}

export function FactorAnalysis() {
  const [analysis, setAnalysis] = useState<FactorAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'performance' | 'attribution' | 'rotation'>('performance')
  const [updateCount, setUpdateCount] = useState(0)

  const generateFactorData = (): FactorAnalysis => {
    const timeVariation = Date.now() % 100000 / 100000
    
    const factors: FactorData[] = [
      {
        factor: 'Momentum',
        current_loading: 0.65 + (timeVariation * 0.2),
        performance_1m: 8.4 + (timeVariation * 3),
        performance_3m: 15.2 + (timeVariation * 5),
        performance_ytd: 22.7 + (timeVariation * 8),
        sharpe_ratio: 1.8 + (timeVariation * 0.4),
        volatility: 12.3 + (timeVariation * 2),
        status: 'outperforming',
        description: 'Cross-sectional and time-series momentum across multiple timeframes'
      },
      {
        factor: 'Mean Reversion',
        current_loading: 0.25 + (timeVariation * 0.15),
        performance_1m: 3.1 + (timeVariation * 2),
        performance_3m: 7.8 + (timeVariation * 3),
        performance_ytd: 11.4 + (timeVariation * 4),
        sharpe_ratio: 2.1 + (timeVariation * 0.3),
        volatility: 8.7 + (timeVariation * 1.5),
        status: 'neutral',
        description: 'Statistical arbitrage and pairs trading strategies'
      },
      {
        factor: 'Volatility',
        current_loading: 0.15 + (timeVariation * 0.1),
        performance_1m: 5.6 + (timeVariation * 2.5),
        performance_3m: 12.3 + (timeVariation * 4),
        performance_ytd: 18.9 + (timeVariation * 6),
        sharpe_ratio: 1.6 + (timeVariation * 0.35),
        volatility: 15.2 + (timeVariation * 3),
        status: 'outperforming',
        description: 'Volatility surface arbitrage and VIX-based strategies'
      },
      {
        factor: 'Carry',
        current_loading: 0.35 + (timeVariation * 0.2),
        performance_1m: 2.8 + (timeVariation * 1.5),
        performance_3m: 6.4 + (timeVariation * 2.5),
        performance_ytd: 9.7 + (timeVariation * 3.5),
        sharpe_ratio: 2.3 + (timeVariation * 0.25),
        volatility: 6.8 + (timeVariation * 1),
        status: 'neutral',
        description: 'Interest rate differentials and yield curve strategies'
      },
      {
        factor: 'Quality',
        current_loading: 0.45 + (timeVariation * 0.15),
        performance_1m: 4.2 + (timeVariation * 2),
        performance_3m: 9.1 + (timeVariation * 3),
        performance_ytd: 14.6 + (timeVariation * 5),
        sharpe_ratio: 1.9 + (timeVariation * 0.3),
        volatility: 10.4 + (timeVariation * 2),
        status: 'underperforming',
        description: 'Fundamental quality metrics and balance sheet strength'
      }
    ]

    return {
      factors,
      portfolio_attribution: [
        { factor: 'Momentum', contribution: 4.2 + (timeVariation * 2), weight: 35 },
        { factor: 'Mean Reversion', contribution: 1.8 + (timeVariation * 1), weight: 25 },
        { factor: 'Volatility', contribution: 2.1 + (timeVariation * 1.5), weight: 20 },
        { factor: 'Carry', contribution: 0.9 + (timeVariation * 0.8), weight: 15 },
        { factor: 'Quality', contribution: -0.3 + (timeVariation * 0.5), weight: 5 }
      ],
      factor_rotation_signal: {
        from_factor: 'Quality',
        to_factor: 'Momentum',
        strength: Math.floor(75 + timeVariation * 20),
        timeframe: '2-4 weeks'
      },
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 400))
    setAnalysis(generateFactorData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 90 * 1000) // Update every 90 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'outperforming': return 'text-green-600 bg-green-50 border-green-200'
      case 'underperforming': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'outperforming': return <TrendingUp className="h-4 w-4" />
      case 'underperforming': return <TrendingDown className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Quantitative Factor Analysis</h3>
            <p className="text-sm text-gray-600">
              Multi-factor model • Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-orange-600 font-medium">LIVE</span>
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
        {[
          { id: 'performance', name: 'Factor Performance', icon: TrendingUp },
          { id: 'attribution', name: 'Portfolio Attribution', icon: BarChart3 },
          { id: 'rotation', name: 'Factor Rotation', icon: Zap }
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedView === view.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <view.icon className="h-4 w-4" />
            <span>{view.name}</span>
          </button>
        ))}
      </div>

      {loading && !analysis ? (
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      ) : analysis && (
        <div className="space-y-6">
          {selectedView === 'performance' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-900">Factor</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-900">Loading</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-900">1M</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-900">3M</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-900">YTD</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-900">Sharpe</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.factors.map((factor, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-gray-900">{factor.factor}</div>
                          <div className="text-xs text-gray-600">{factor.description}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 font-mono text-sm">
                        {factor.current_loading.toFixed(2)}
                      </td>
                      <td className={`text-right py-3 font-medium text-sm ${
                        factor.performance_1m > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {factor.performance_1m > 0 ? '+' : ''}{factor.performance_1m.toFixed(1)}%
                      </td>
                      <td className={`text-right py-3 font-medium text-sm ${
                        factor.performance_3m > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {factor.performance_3m > 0 ? '+' : ''}{factor.performance_3m.toFixed(1)}%
                      </td>
                      <td className={`text-right py-3 font-medium text-sm ${
                        factor.performance_ytd > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {factor.performance_ytd > 0 ? '+' : ''}{factor.performance_ytd.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 font-mono text-sm">
                        {factor.sharpe_ratio.toFixed(2)}
                      </td>
                      <td className="text-center py-3">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(factor.status)}`}>
                          {getStatusIcon(factor.status)}
                          <span className="capitalize">{factor.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedView === 'attribution' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Portfolio Factor Attribution</h4>
              <div className="space-y-3">
                {analysis.portfolio_attribution.map((attr, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {attr.factor.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{attr.factor}</div>
                        <div className="text-sm text-gray-600">Weight: {attr.weight}%</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        attr.contribution > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {attr.contribution > 0 ? '+' : ''}{attr.contribution.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Contribution</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'rotation' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Factor Rotation Signal</h4>
              <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                    <div>
                      <h5 className="font-bold text-purple-900">Active Rotation Signal</h5>
                      <p className="text-sm text-purple-700">
                        {analysis.factor_rotation_signal.from_factor} → {analysis.factor_rotation_signal.to_factor}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-900">
                      {analysis.factor_rotation_signal.strength}%
                    </div>
                    <div className="text-sm text-purple-700">Strength</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">From Factor:</span>
                    <span className="font-medium ml-2 text-purple-900">
                      {analysis.factor_rotation_signal.from_factor}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">To Factor:</span>
                    <span className="font-medium ml-2 text-purple-900">
                      {analysis.factor_rotation_signal.to_factor}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Timeframe:</span>
                    <span className="font-medium ml-2 text-purple-900">
                      {analysis.factor_rotation_signal.timeframe}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Confidence:</span>
                    <span className="font-medium ml-2 text-purple-900">
                      {analysis.factor_rotation_signal.strength}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}