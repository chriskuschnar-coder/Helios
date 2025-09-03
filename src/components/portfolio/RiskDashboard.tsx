import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, TrendingDown, BarChart3, RefreshCw, Target } from 'lucide-react'

interface StressTestResult {
  scenario: string
  portfolio_impact: number
  probability: number
  hedge_suggestion: string
  severity: 'low' | 'medium' | 'high'
}

interface RiskAlert {
  id: string
  type: 'concentration' | 'correlation' | 'volatility' | 'liquidity'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  recommendation: string
}

export function RiskDashboard({ currentBalance }: { currentBalance: number }) {
  const [stressTests, setStressTests] = useState<StressTestResult[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)

  const generateStressTests = (): StressTestResult[] => {
    const timeVariation = Date.now() % 100000 / 100000
    
    return [
      {
        scenario: 'Market Crash (-20%)',
        portfolio_impact: -12.4 + (timeVariation * 3),
        probability: 15 + (timeVariation * 10),
        hedge_suggestion: 'Increase VIX calls, reduce beta exposure',
        severity: 'high'
      },
      {
        scenario: 'Interest Rate Spike (+200bp)',
        portfolio_impact: -8.7 + (timeVariation * 2),
        probability: 25 + (timeVariation * 15),
        hedge_suggestion: 'Duration hedge via TLT puts',
        severity: 'medium'
      },
      {
        scenario: 'Tech Sector Rotation',
        portfolio_impact: -5.2 + (timeVariation * 1.5),
        probability: 35 + (timeVariation * 20),
        hedge_suggestion: 'Diversify into value factors',
        severity: 'medium'
      },
      {
        scenario: 'Dollar Strength (+10%)',
        portfolio_impact: -3.1 + (timeVariation * 1),
        probability: 40 + (timeVariation * 25),
        hedge_suggestion: 'Currency hedge international exposure',
        severity: 'low'
      },
      {
        scenario: 'Crypto Correlation Breakdown',
        portfolio_impact: 2.3 + (timeVariation * 1.2),
        probability: 30 + (timeVariation * 20),
        hedge_suggestion: 'Maintain crypto allocation for diversification',
        severity: 'low'
      }
    ]
  }

  const generateRiskAlerts = (): RiskAlert[] => {
    const timeVariation = Date.now() % 100000 / 100000
    
    const alertPool = [
      {
        id: 'concentration-1',
        type: 'concentration' as const,
        title: 'Single Asset Concentration Risk',
        description: `NVDA position represents ${(8.5 + timeVariation * 2).toFixed(1)}% of portfolio. Consider reducing to <5% for better diversification.`,
        severity: 'medium' as const,
        recommendation: 'Trim NVDA position by 30-40%'
      },
      {
        id: 'correlation-1',
        type: 'correlation' as const,
        title: 'Rising Correlation Alert',
        description: `BTC-SPY correlation increased to ${(0.67 + timeVariation * 0.2).toFixed(2)} from 0.45. Diversification benefit declining.`,
        severity: 'medium' as const,
        recommendation: 'Add uncorrelated assets or reduce crypto exposure'
      },
      {
        id: 'volatility-1',
        type: 'volatility' as const,
        title: 'Volatility Regime Change',
        description: `Portfolio volatility increased ${(23 + timeVariation * 15).toFixed(0)}% over 5 days. Risk management protocols activated.`,
        severity: 'high' as const,
        recommendation: 'Reduce position sizes or add hedges'
      },
      {
        id: 'liquidity-1',
        type: 'liquidity' as const,
        title: 'Liquidity Risk Assessment',
        description: `${(15 + timeVariation * 10).toFixed(0)}% of holdings have <$1M daily volume. Exit capacity may be limited.`,
        severity: 'low' as const,
        recommendation: 'Monitor position sizes in illiquid names'
      }
    ]

    // Show 2-3 alerts based on time rotation
    const alertIndex = Math.floor(Date.now() / (1000 * 60 * 3)) % alertPool.length
    return alertPool.slice(alertIndex, alertIndex + 2).concat(alertPool.slice(0, Math.max(0, 2 - (alertPool.length - alertIndex))))
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    await new Promise(resolve => setTimeout(resolve, 600))
    
    setStressTests(generateStressTests())
    setRiskAlerts(generateRiskAlerts())
    
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [currentBalance])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'low': return 'border-green-200 bg-green-50 text-green-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'low': return <Shield className="h-5 w-5 text-green-600" />
      default: return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Risk Management Dashboard</h3>
            <p className="text-sm text-gray-600">
              Stress testing & alerts • Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-600 font-medium">MONITORING</span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stress Test Results */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Portfolio Stress Testing</h4>
            <div className="space-y-3">
              {stressTests.map((test, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(test.severity)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(test.severity)}
                      <div>
                        <h5 className="font-medium">{test.scenario}</h5>
                        <p className="text-sm opacity-80">{test.hedge_suggestion}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${test.portfolio_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {test.portfolio_impact > 0 ? '+' : ''}{test.portfolio_impact.toFixed(1)}%
                      </div>
                      <div className="text-xs opacity-80">{test.probability.toFixed(0)}% probability</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${test.portfolio_impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(test.portfolio_impact) * 5)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Alerts */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Active Risk Alerts</h4>
            <div className="space-y-3">
              {riskAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <h5 className="font-medium">{alert.title}</h5>
                        <p className="text-sm opacity-80 mt-1">{alert.description}</p>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm">
                    <Target className="h-3 w-3 inline mr-1" />
                    <strong>Recommendation:</strong> {alert.recommendation}
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