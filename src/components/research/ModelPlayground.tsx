import React, { useState } from 'react'
import { Brain, Play, Settings, BarChart3, TrendingUp, Target, Zap } from 'lucide-react'

interface ModelParameters {
  lookback_period: number
  rebalance_frequency: number
  volatility_target: number
  max_position_size: number
  stop_loss: number
  take_profit: number
}

interface BacktestResult {
  total_return: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  total_trades: number
  avg_trade_duration: number
}

export function ModelPlayground() {
  const [selectedModel, setSelectedModel] = useState<'momentum' | 'mean_reversion' | 'volatility_targeting'>('momentum')
  const [parameters, setParameters] = useState<ModelParameters>({
    lookback_period: 20,
    rebalance_frequency: 5,
    volatility_target: 15,
    max_position_size: 10,
    stop_loss: 5,
    take_profit: 15
  })
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const models = [
    {
      id: 'momentum',
      name: 'Cross-Sectional Momentum',
      description: 'Rank assets by recent performance and go long winners, short losers',
      icon: TrendingUp
    },
    {
      id: 'mean_reversion',
      name: 'Statistical Arbitrage',
      description: 'Identify mean-reverting pairs and trade deviations from fair value',
      icon: Target
    },
    {
      id: 'volatility_targeting',
      name: 'Volatility Targeting',
      description: 'Dynamically adjust position sizes based on realized volatility',
      icon: Zap
    }
  ]

  const runBacktest = async () => {
    setIsRunning(true)
    
    // Simulate backtest calculation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate realistic results based on parameters
    const baseReturn = selectedModel === 'momentum' ? 18.5 : 
                      selectedModel === 'mean_reversion' ? 12.3 : 15.7
    
    const parameterImpact = (parameters.volatility_target / 15) * 
                           (parameters.rebalance_frequency / 5) * 
                           (parameters.lookback_period / 20)
    
    const result: BacktestResult = {
      total_return: baseReturn * parameterImpact + (Math.random() - 0.5) * 5,
      sharpe_ratio: (1.8 + parameterImpact * 0.5) + (Math.random() - 0.5) * 0.4,
      max_drawdown: (8.5 - parameterImpact * 2) + (Math.random() - 0.5) * 2,
      win_rate: (65 + parameterImpact * 5) + (Math.random() - 0.5) * 8,
      total_trades: Math.floor(250 * (parameters.rebalance_frequency / 5) * (1 + Math.random() * 0.3)),
      avg_trade_duration: Math.floor(parameters.rebalance_frequency * (1 + Math.random() * 0.5))
    }
    
    setBacktestResult(result)
    setIsRunning(false)
  }

  const handleParameterChange = (param: keyof ModelParameters, value: number) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }))
    setBacktestResult(null) // Clear results when parameters change
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Interactive Model Playground</h3>
            <p className="text-sm text-gray-600">
              Test and customize quantitative strategies
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Model Selection & Parameters */}
        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Select Strategy</h4>
            <div className="space-y-3">
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id as any)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedModel === model.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <model.icon className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-600">{model.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Model Parameters</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lookback Period: {parameters.lookback_period} days
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={parameters.lookback_period}
                  onChange={(e) => handleParameterChange('lookback_period', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebalance Frequency: {parameters.rebalance_frequency} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={parameters.rebalance_frequency}
                  onChange={(e) => handleParameterChange('rebalance_frequency', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volatility Target: {parameters.volatility_target}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={parameters.volatility_target}
                  onChange={(e) => handleParameterChange('volatility_target', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Position Size: {parameters.max_position_size}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={parameters.max_position_size}
                  onChange={(e) => handleParameterChange('max_position_size', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Run Backtest Button */}
          <button
            onClick={runBacktest}
            disabled={isRunning}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Run Backtest Simulation
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Backtest Results</h4>
          
          {backtestResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    +{backtestResult.total_return.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">Total Return</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {backtestResult.sharpe_ratio.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">Sharpe Ratio</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-900">
                    -{backtestResult.max_drawdown.toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-700">Max Drawdown</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {backtestResult.win_rate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-700">Win Rate</div>
                </div>
              </div>
              
              <div className="bg-navy-50 rounded-lg p-4">
                <h5 className="font-medium text-navy-900 mb-3">Trading Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-700">Total Trades:</span>
                    <span className="font-medium text-navy-900">{backtestResult.total_trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-700">Avg Duration:</span>
                    <span className="font-medium text-navy-900">{backtestResult.avg_trade_duration} days</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 mb-2">Parameter Impact Analysis</h5>
                <p className="text-sm text-yellow-700">
                  Current parameters show {backtestResult.sharpe_ratio > 2.0 ? 'excellent' : 
                                         backtestResult.sharpe_ratio > 1.5 ? 'good' : 'moderate'} risk-adjusted performance. 
                  {backtestResult.max_drawdown < 10 ? ' Low drawdown indicates strong risk management.' : 
                   ' Consider reducing position sizes to lower drawdown.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h5 className="font-medium text-gray-900 mb-2">Ready to Test</h5>
              <p className="text-sm text-gray-600">
                Adjust parameters and run a backtest to see how your strategy would have performed historically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}