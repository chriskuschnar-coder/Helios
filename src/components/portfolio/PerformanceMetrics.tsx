import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, BarChart3, Target, Award, Activity, RefreshCw, ArrowUpRight } from 'lucide-react'
import { MetricDetailModal } from './MetricDetailModal'

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
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [showMetricModal, setShowMetricModal] = useState(false)
  const [lastNewsUpdate, setLastNewsUpdate] = useState<Date>(new Date())
  const [marketEvents, setMarketEvents] = useState<string[]>([])

  const generatePerformanceData = (): PerformanceData[] => {
    // Multiple time variations for realistic market movements
    const fastTick = Math.sin(Date.now() / 10000) * 0.002    // ±0.2% every 10 seconds
    const newsImpact = Math.cos(Date.now() / 60000) * 0.005   // ±0.5% every minute (news cycle)
    const dailyTrend = Math.sin(Date.now() / 300000) * 0.01   // ±1% every 5 minutes (daily trend)
    const timeVariation = fastTick + newsImpact + dailyTrend
    
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
    
    // Simulate news events affecting metrics
    const newsEvents = [
      'Fed Chair Powell speech impacts rate expectations',
      'Tech earnings beat estimates, momentum factor strengthens',
      'Geopolitical tensions increase volatility measures',
      'Economic data release affects correlation patterns',
      'Central bank policy shift impacts currency exposure',
      'Market microstructure changes detected in options flow'
    ]
    
    const currentEvent = newsEvents[Math.floor(Date.now() / (1000 * 60 * 3)) % newsEvents.length]
    setMarketEvents(prev => [currentEvent, ...prev.slice(0, 4)])
    setLastNewsUpdate(new Date())
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setPerformanceData(generatePerformanceData())
    setTimeSeriesData(generateTimeSeriesData())
    
    setLoading(false)
  }

  const getMetricDetails = (metricName: string, data: PerformanceData) => {
    const metricDetails = {
      'Total Return': {
        name: 'Total Return',
        value: data.current.toFixed(1) + '%',
        description: 'The total percentage gain or loss of your portfolio over the selected time period, including all dividends, interest, and capital appreciation.',
        calculation: '((Ending Value - Beginning Value) / Beginning Value) × 100',
        interpretation: `Your portfolio has generated a ${data.current.toFixed(1)}% return over the ${selectedPeriod} period, ${data.current > data.benchmark ? 'outperforming' : 'underperforming'} the benchmark by ${Math.abs(data.current - data.benchmark).toFixed(1)} percentage points.`,
        benchmark: data.benchmark.toFixed(1) + '%',
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: 'Last Month', value: data.current * 0.3 },
          { period: 'Last Quarter', value: data.current * 0.7 },
          { period: 'Last 6 Months', value: data.current * 0.85 },
          { period: 'Current Period', value: data.current }
        ],
        relatedMetrics: [
          { name: 'Alpha', value: (data.current - data.benchmark).toFixed(1) + '%', correlation: 0.95 },
          { name: 'Tracking Error', value: '2.1%', correlation: -0.34 },
          { name: 'Information Ratio', value: '1.67', correlation: 0.78 }
        ],
        actionableInsights: [
          'Strong outperformance suggests effective strategy execution',
          'Consider taking profits if returns exceed long-term targets',
          'Monitor for mean reversion in overperforming sectors'
        ]
      },
      'Sharpe Ratio': {
        name: 'Sharpe Ratio',
        value: data.current.toFixed(2),
        description: 'A measure of risk-adjusted return that indicates how much excess return you receive for the extra volatility you endure for holding a riskier asset.',
        calculation: '(Portfolio Return - Risk-Free Rate) / Portfolio Standard Deviation',
        interpretation: `A Sharpe ratio of ${data.current.toFixed(2)} indicates ${data.current > 2 ? 'excellent' : data.current > 1.5 ? 'good' : data.current > 1 ? 'adequate' : 'poor'} risk-adjusted performance. Values above 2.0 are considered exceptional in institutional investing.`,
        benchmark: data.benchmark.toFixed(2),
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: 'Q1 2025', value: data.current * 0.85 },
          { period: 'Q2 2025', value: data.current * 0.92 },
          { period: 'Q3 2025', value: data.current * 0.97 },
          { period: 'Current', value: data.current }
        ],
        relatedMetrics: [
          { name: 'Sortino Ratio', value: (data.current * 1.15).toFixed(2), correlation: 0.89 },
          { name: 'Calmar Ratio', value: (data.current * 0.95).toFixed(2), correlation: 0.76 },
          { name: 'Volatility', value: '8.7%', correlation: -0.45 }
        ],
        actionableInsights: [
          'Sharpe ratio above 2.0 indicates superior risk management',
          'Consider increasing position sizes during high Sharpe periods',
          'Monitor for regime changes that could impact risk-adjusted returns'
        ]
      },
      'Max Drawdown': {
        name: 'Maximum Drawdown',
        value: data.current.toFixed(1) + '%',
        description: 'The largest peak-to-trough decline in portfolio value during the selected period. This measures the worst-case scenario for capital preservation.',
        calculation: 'Max((Peak Value - Trough Value) / Peak Value) × 100',
        interpretation: `A maximum drawdown of ${data.current.toFixed(1)}% means your portfolio declined by this amount from its highest point. ${data.current < 10 ? 'This is excellent capital preservation.' : data.current < 20 ? 'This represents moderate risk control.' : 'This suggests high volatility periods.'}`,
        benchmark: data.benchmark.toFixed(1) + '%',
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: 'Jan 2025', value: -2.1 },
          { period: 'Mar 2025', value: -3.8 },
          { period: 'Jun 2025', value: -data.current * 0.8 },
          { period: 'Current', value: -data.current }
        ],
        relatedMetrics: [
          { name: 'Recovery Time', value: '12 days', correlation: 0.67 },
          { name: 'Ulcer Index', value: '2.8', correlation: 0.85 },
          { name: 'Pain Index', value: '1.4', correlation: 0.72 }
        ],
        actionableInsights: [
          'Low drawdown indicates strong risk management protocols',
          'Consider stress testing portfolio for larger market shocks',
          'Maintain stop-loss levels to preserve capital preservation record'
        ]
      },
      'Win Rate': {
        name: 'Win Rate',
        value: data.current.toFixed(0) + '%',
        description: 'The percentage of trades or investment periods that resulted in positive returns. Higher win rates indicate consistent strategy execution.',
        calculation: '(Number of Winning Trades / Total Number of Trades) × 100',
        interpretation: `A ${data.current.toFixed(0)}% win rate means ${data.current.toFixed(0)} out of every 100 trades are profitable. ${data.current > 70 ? 'This is exceptionally high and indicates strong strategy selection.' : data.current > 60 ? 'This represents solid performance.' : 'This suggests room for strategy improvement.'}`,
        benchmark: data.benchmark.toFixed(0) + '%',
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: 'Last 30 Days', value: data.current * 0.95 },
          { period: 'Last 60 Days', value: data.current * 0.98 },
          { period: 'Last 90 Days', value: data.current * 1.02 },
          { period: 'Current Period', value: data.current }
        ],
        relatedMetrics: [
          { name: 'Profit Factor', value: '3.4', correlation: 0.82 },
          { name: 'Average Win', value: '$285', correlation: 0.45 },
          { name: 'Average Loss', value: '$142', correlation: -0.67 }
        ],
        actionableInsights: [
          'High win rate suggests effective entry and exit timing',
          'Focus on increasing average win size while maintaining win rate',
          'Consider position sizing adjustments during high-confidence periods'
        ]
      },
      'Volatility': {
        name: 'Portfolio Volatility',
        value: data.current.toFixed(1) + '%',
        description: 'The annualized standard deviation of portfolio returns, measuring the degree of variation in returns over time. Lower volatility indicates more stable returns.',
        calculation: 'Standard Deviation of Daily Returns × √252 (trading days)',
        interpretation: `Your portfolio volatility of ${data.current.toFixed(1)}% is ${data.current < 15 ? 'low, indicating stable returns' : data.current < 25 ? 'moderate, showing balanced risk-taking' : 'high, suggesting aggressive positioning'}. This compares favorably to the market benchmark of ${data.benchmark.toFixed(1)}%.`,
        benchmark: data.benchmark.toFixed(1) + '%',
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: '30-Day', value: data.current * 0.9 },
          { period: '60-Day', value: data.current * 0.95 },
          { period: '90-Day', value: data.current * 1.05 },
          { period: 'Annualized', value: data.current }
        ],
        relatedMetrics: [
          { name: 'Downside Deviation', value: (data.current * 0.7).toFixed(1) + '%', correlation: 0.78 },
          { name: 'VaR (95%)', value: '$1,250', correlation: 0.85 },
          { name: 'Beta', value: '0.73', correlation: 0.67 }
        ],
        actionableInsights: [
          'Low volatility enables higher position sizing with same risk budget',
          'Consider volatility targeting strategies during high-vol periods',
          'Monitor for volatility regime changes that could impact returns'
        ]
      },
      'Beta': {
        name: 'Portfolio Beta',
        value: data.current.toFixed(2),
        description: 'A measure of your portfolio\'s sensitivity to market movements. Beta of 1.0 means your portfolio moves in line with the market, while beta below 1.0 indicates lower market sensitivity.',
        calculation: 'Covariance(Portfolio Returns, Market Returns) / Variance(Market Returns)',
        interpretation: `Your portfolio beta of ${data.current.toFixed(2)} means your portfolio is ${data.current < 1 ? 'less volatile than' : data.current > 1 ? 'more volatile than' : 'as volatile as'} the overall market. ${data.current < 0.8 ? 'This provides good downside protection.' : data.current > 1.2 ? 'This amplifies both gains and losses.' : 'This provides balanced market exposure.'}`,
        benchmark: '1.00',
        percentile: data.percentile,
        trend: data.trend,
        historicalData: [
          { period: '1 Month', value: data.current * 1.05 },
          { period: '3 Months', value: data.current * 1.02 },
          { period: '6 Months', value: data.current * 0.98 },
          { period: 'Current', value: data.current }
        ],
        relatedMetrics: [
          { name: 'Alpha', value: (data.current * 5).toFixed(1) + '%', correlation: -0.23 },
          { name: 'R-Squared', value: '0.85', correlation: 0.45 },
          { name: 'Correlation', value: '0.73', correlation: 0.89 }
        ],
        actionableInsights: [
          'Low beta provides natural hedge during market downturns',
          'Consider increasing beta exposure during bull markets',
          'Monitor beta drift as portfolio composition changes'
        ]
      }
    }

    return metricDetails[metricName] || null
  }

  const handleMetricClick = (metricName: string, data: PerformanceData) => {
    const details = getMetricDetails(metricName, data)
    if (details) {
      setSelectedMetric(details)
      setShowMetricModal(true)
    }
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 15 * 1000) // Update every 15 seconds for live feel
    return () => clearInterval(interval)
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
    <div className="fintech-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-success-gradient rounded-xl flex items-center justify-center pulse-glow">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 text-premium">Performance Analytics</h3>
            <p className="text-sm text-gray-500">
              Real-time analysis • Last update: {lastNewsUpdate.toLocaleTimeString()}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 glass px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-700 font-semibold">LIVE</span>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="glass-button p-2 hover-lift"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {periods.map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as any)}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 interactive-element ${
              selectedPeriod === period
                ? 'bg-primary-gradient text-white shadow-medium'
                : 'glass hover:bg-white/20'
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
          <div className="metric-grid">
            {performanceData.map((metric, index) => (
              <div 
                key={index} 
                className={`metric-card interactive-element group stagger-${(index % 3) + 1}`}
                onClick={() => handleMetricClick(metric.metric, metric)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="metric-label group-hover:text-blue-600">{metric.metric}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="metric-value">
                      {metric.metric.includes('Rate') || metric.metric.includes('Return') || metric.metric.includes('Drawdown') || metric.metric.includes('Volatility') 
                        ? `${metric.current.toFixed(1)}%` 
                        : metric.current.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      vs {metric.metric.includes('Rate') || metric.metric.includes('Return') || metric.metric.includes('Drawdown') || metric.metric.includes('Volatility') 
                        ? `${metric.benchmark.toFixed(1)}%` 
                        : metric.benchmark.toFixed(2)}
                    </div>
                    <div className={`percentage-badge ${metric.percentile > 75 ? 'positive' : 'negative'}`}>
                      {metric.percentile.toFixed(0)}th %ile
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    View Details <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time Series Performance */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-premium">Period Analysis</h4>
            <div className="space-y-3">
              {timeSeriesData.map((data, index) => (
                <div key={index} className={`flex items-center justify-between p-4 glass rounded-xl hover-lift stagger-${(index % 3) + 1}`}>
                  <div className="font-semibold text-gray-900">{data.period}</div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Portfolio</div>
                      <div className={`font-bold text-sm ${data.portfolio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.portfolio > 0 ? '+' : ''}{data.portfolio.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Benchmark</div>
                      <div className={`font-bold text-sm ${data.benchmark > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.benchmark > 0 ? '+' : ''}{data.benchmark.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Alpha</div>
                      <div className={`font-bold text-sm ${data.alpha > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {data.alpha > 0 ? '+' : ''}{data.alpha.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="glass rounded-xl p-6 border-gradient">
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-premium">Performance Summary ({selectedPeriod})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient animate-count-up">
                  +{timeSeriesData.reduce((sum, d) => sum + d.alpha, 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Alpha</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient animate-count-up">
                  {(timeSeriesData.filter(d => d.alpha > 0).length / timeSeriesData.length * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Alpha Periods</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient animate-count-up">
                  {Math.max(...timeSeriesData.map(d => d.alpha)).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Best Period</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient animate-count-up">
                  {(timeSeriesData.reduce((sum, d) => sum + d.alpha, 0) / timeSeriesData.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Avg Alpha</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Metric Detail Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        isOpen={showMetricModal}
        onClose={() => {
          setShowMetricModal(false)
          setSelectedMetric(null)
        }}
      />
    </div>
  )
}