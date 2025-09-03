import React, { useState, useEffect } from 'react'
import { Target, Zap, TrendingUp, BarChart3, RefreshCw, Play, Settings } from 'lucide-react'

interface OptimizationResult {
  current_allocation: { [key: string]: number }
  optimal_allocation: { [key: string]: number }
  expected_improvement: {
    return_increase: number
    risk_reduction: number
    sharpe_improvement: number
  }
  rebalancing_trades: {
    asset: string
    action: 'buy' | 'sell'
    amount: number
    percentage: number
  }[]
  confidence: number
}

interface OptimizationConstraints {
  max_position_size: number
  min_position_size: number
  max_turnover: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  rebalance_threshold: number
}

export function OptimizationEngine({ currentBalance }: { currentBalance: number }) {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    max_position_size: 25,
    min_position_size: 2,
    max_turnover: 20,
    risk_tolerance: 'moderate',
    rebalance_threshold: 5
  })
  const [loading, setLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)

  const generateOptimizationResult = (): OptimizationResult => {
    const timeVariation = Date.now() % 100000 / 100000
    
    const current_allocation = {
      'Alpha Fund': 65 + (timeVariation * 5),
      'Market Neutral': 25 + (timeVariation * 3),
      'Momentum Portfolio': 10 + (timeVariation * 2)
    }

    const optimal_allocation = {
      'Alpha Fund': 62 + (timeVariation * 4),
      'Market Neutral': 28 + (timeVariation * 2),
      'Momentum Portfolio': 10 + (timeVariation * 1)
    }

    const rebalancing_trades = [
      {
        asset: 'Alpha Fund',
        action: 'sell' as const,
        amount: currentBalance * 0.03,
        percentage: -3
      },
      {
        asset: 'Market Neutral',
        action: 'buy' as const,
        amount: currentBalance * 0.03,
        percentage: 3
      }
    ]

    return {
      current_allocation,
      optimal_allocation,
      expected_improvement: {
        return_increase: 0.8 + (timeVariation * 0.5),
        risk_reduction: 1.2 + (timeVariation * 0.8),
        sharpe_improvement: 0.15 + (timeVariation * 0.1)
      },
      rebalancing_trades,
      confidence: Math.floor(82 + timeVariation * 15)
    }
  }

  const runOptimization = async () => {
    setIsRunning(true)
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    // Simulate optimization calculation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setOptimization(generateOptimizationResult())
    setLoading(false)
    setIsRunning(false)
  }

  useEffect(() => {
    if (currentBalance > 0) {
      runOptimization()
    }
  }, [currentBalance])

  const handleConstraintChange = (key: keyof OptimizationConstraints, value: any) => {
    setConstraints(prev => ({
      ...prev,
      [key]: value
    }))
    setOptimization(null) // Clear results when constraints change
  }

  const getActionColor = (action: string) => {
    return action === 'buy' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Portfolio Optimization Engine</h3>
            <p className="text-sm text-gray-600">
              Mean-variance optimization • Update #{updateCount}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 font-medium">OPTIMIZING</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Optimization Constraints */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Optimization Parameters</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Position Size: {constraints.max_position_size}%
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={constraints.max_position_size}
                onChange={(e) => handleConstraintChange('max_position_size', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rebalance Threshold: {constraints.rebalance_threshold}%
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={constraints.rebalance_threshold}
                onChange={(e) => handleConstraintChange('rebalance_threshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Tolerance
              </label>
              <select
                value={constraints.risk_tolerance}
                onChange={(e) => handleConstraintChange('risk_tolerance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={runOptimization}
            disabled={isRunning || currentBalance === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running Optimization...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Optimize Portfolio
              </>
            )}
          </button>
        </div>

        {/* Optimization Results */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Optimization Results</h4>
          
          {optimization ? (
            <div className="space-y-4">
              {/* Expected Improvements */}
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-3">Expected Improvements</h5>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-900">
                      +{optimization.expected_improvement.return_increase.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-700">Return Increase</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-900">
                      -{optimization.expected_improvement.risk_reduction.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-700">Risk Reduction</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-900">
                      +{optimization.expected_improvement.sharpe_improvement.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-700">Sharpe Improvement</div>
                  </div>
                </div>
              </div>

              {/* Rebalancing Trades */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Recommended Trades</h5>
                <div className="space-y-2">
                  {optimization.rebalancing_trades.map((trade, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getActionColor(trade.action)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trade.action.toUpperCase()}</span>
                          <span>{trade.asset}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${trade.amount.toLocaleString()}</div>
                          <div className="text-sm">{trade.percentage > 0 ? '+' : ''}{trade.percentage}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Optimization Confidence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${optimization.confidence}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-900">{optimization.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h5 className="font-medium text-gray-900 mb-2">Ready to Optimize</h5>
              <p className="text-sm text-gray-600">
                Adjust parameters and run optimization to see recommended portfolio improvements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}