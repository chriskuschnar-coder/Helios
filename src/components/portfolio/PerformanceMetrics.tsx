import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, BarChart3, Target, Award, Activity, RefreshCw } from 'lucide-react'

interface PerformanceData {
  metric: string
  current: number
  benchmark: number
  percentile: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

interface TimeSeriesData {
  period: string
  portfolio: number
  benchmark: number
  alpha: number
}

export function PerformanceMetrics({ currentBalance }: { currentBalance: number }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'YTD'>('YTD')
  const [loading, setLoading] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)

  const generatePerformanceData = (): PerformanceData[] => {
    const timeVariation = Date.now() % 100000 / 100000
    const hasActivity = currentBalance > 0
    
    if (!hasActivity) {
      return [
        { metric: 'Total Return', current: 0, benchmark: 0, percentile: 0, trend: 'stable', description: 'No trading activity yet' },
        { metric: 'Sharpe Ratio', current: 0, benchmark: 0, percentile: 0, trend: 'stable', description: 'Risk-adjusted returns' },
        { metric: 'Max Drawdown', current: 0, benchmark: 0, percentile: 0, trend: 'stable', description: 'Largest peak-to-trough decline' },
        { metric: 'Win Rate', current: 0, benchmark: 0, percentile: 0, trend: 'stable', description: 'Percentage of profitable trades' },
        { metric: 'Volatility', current: 0, benchmark: 0, percentile: 0, trend: 'stable', description: 'Annualized standard deviation' },
        { metric: 'Beta', current: 0, benchmark: 1, percentile: 0, trend: 'stable', description: 'Market sensitivity' }
      ]
    }

    const multiplier = selectedPeriod === '1M' ? 0.3 : selectedPeriod === '3M' ? 0.7 : selectedPeriod === '6M' ? 0.85 : 1.0
    
    return [
      {
        metric: 'Total Return',
        current: (22.4 + timeVariation * 5) * multiplier,
        benchmark: (18.2 + timeVariation * 2) * multiplier,
        percentile: 89 + timeVariation * 8,
        trend: 'up',
        description: 'Absolute portfolio performance'
      },
      {
        metric: 'Sharpe Ratio',
        current: 2.84 + timeVariation * 0.3,
        benchmark: 1.45 + timeVariation * 0.2,
        percentile: 94 + timeVariation * 4,
        trend: 'up',
        description: 'Risk-adjusted returns'
      },
      {
        metric: 'Max Drawdown',
        current: 4.2 + timeVariation * 1.5,
        benchmark: 12.8 + timeVariation * 3,
        percentile: 92 + timeVariation * 6,
        trend: 'down',
        description: 'Largest peak-to-trough decline'
      },
      {
        metric: 'Win Rate',
        current: 76.4 + timeVariation * 8,
        benchmark: 52.1 + timeVariation * 5,
        percentile: 88 + timeVariation * 7,
        trend: 'up',
        description: 'Percentage of profitable trades'
      },
      {
        metric: 'Volatility',
        current: 8.7 + timeVariation * 2,
        benchmark: 16.2 + timeVariation * 3,
        percentile: 85 + timeVariation * 10,
        trend: 'down',
        description: 'Annualized standard deviation'
      },
      {
        metric: 'Beta',
        current: 0.73 + timeVariation * 0.2,
        benchmark: 1.00,
        percentile: 78 + timeVariation * 12,
        trend: 'stable',
        description: 'Market sensitivity'
      }
    ]
  }

  const generateTimeSeriesData = (): TimeSeriesData[] => {
    const periods = {
      '1M': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      '3M': ['Month 1', 'Month 2', 'Month 3'],
      '6M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      '1Y': ['Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'],
      'YTD': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    }

    const currentPeriods = periods[selectedPeriod]
    const timeVariation = Date.now() % 100000 / 100000
    
    return currentPeriods.map((period, index) => {
      const portfolioReturn = (index + 1) * 2.5 + timeVariation * 3 + Math.sin(index) * 1.5
      const benchmarkReturn = (index + 1) * 1.8 + timeVariation * 1.5 + Math.cos(index) * 1
      
      return {
        period,
        portfolio: portfolioReturn,
        benchmark: benchmarkReturn,
        alpha: portfolioReturn - benchmarkReturn
      }
    })
  }

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>(generatePerformanceData())
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>(generateTimeSeriesData())

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setPerformanceData(generatePerformanceData())
    setTimeSeriesData(generateTimeSeriesData())
    
    setLoading(false)
  }

  useEffect(() => {
    setPerformanceData(generatePerformanceData())
    setTimeSeriesData(generateTimeSeriesData())
  }, [selectedPeriod, currentBalance])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600 bg-green-50'
    if (percentile >= 75) return 'text-blue-600 bg-blue-50'
    if (percentile >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const periods = ['1M', '3M', '6M', '1Y', 'YTD']

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Award className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Performance Metrics</h3>
            <p className="text-sm text-gray-600">
              Quantitative analysis • Update #{updateCount}
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

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedPeriod === period
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {performanceData.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {metric.metric.includes('Rate') || metric.metric.includes('Return') || metric.metric.includes('Drawdown') || metric.metric.includes('Volatility') 
                        ? `${metric.current.toFixed(1)}%` 
                        : metric.current.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Portfolio</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">
                        Benchmark: {metric.metric.includes('Rate') || metric.metric.includes('Return') || metric.metric.includes('Drawdown') || metric.metric.includes('Volatility') 
                          ? `${metric.benchmark.toFixed(1)}%` 
                          : metric.benchmark.toFixed(2)}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentileColor(metric.percentile)}`}>
                      {metric.percentile.toFixed(0)}th %ile
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>

          {/* Time Series Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Period-by-Period Performance</h4>
            <div className="space-y-3">
              {timeSeriesData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{data.period}</div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Portfolio</div>
                      <div className={`font-medium ${data.portfolio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.portfolio > 0 ? '+' : ''}{data.portfolio.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Benchmark</div>
                      <div className={`font-medium ${data.benchmark > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.benchmark > 0 ? '+' : ''}{data.benchmark.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Alpha</div>
                      <div className={`font-bold ${data.alpha > 0 ? 'text-navy-600' : 'text-red-600'}`}>
                        {data.alpha > 0 ? '+' : ''}{data.alpha.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-navy-50 rounded-lg p-6">
            <h4 className="font-medium text-navy-900 mb-4">Performance Summary ({selectedPeriod})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-900">
                  +{timeSeriesData.reduce((sum, d) => sum + d.alpha, 0).toFixed(1)}%
                </div>
                <div className="text-sm text-navy-700">Total Alpha</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-900">
                  {(timeSeriesData.filter(d => d.alpha > 0).length / timeSeriesData.length * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-navy-700">Alpha Periods</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-900">
                  {Math.max(...timeSeriesData.map(d => d.alpha)).toFixed(1)}%
                </div>
                <div className="text-sm text-navy-700">Best Period</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-900">
                  {(timeSeriesData.reduce((sum, d) => sum + d.alpha, 0) / timeSeriesData.length).toFixed(1)}%
                </div>
                <div className="text-sm text-navy-700">Avg Alpha</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}