import React, { useState, useEffect, useRef } from 'react'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target, 
  Zap, 
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'

interface MT5Data {
  account_number: string
  balance: number
  equity: number
  margin: number
  free_margin: number
  profit: number
  positions_count: number
  timestamp: string
}

interface Position {
  ticket: number
  symbol: string
  type: 'buy' | 'sell'
  volume: number
  open_price: number
  current_price: number
  profit: number
  swap: number
  commission: number
  comment: string
  open_time: string
}

interface TradingSignal {
  id: string
  symbol: string
  action: 'buy' | 'sell' | 'close'
  confidence: number
  entry_price: number
  stop_loss: number
  take_profit: number
  risk_reward: number
  timestamp: string
  status: 'pending' | 'executed' | 'cancelled'
  reasoning: string
}

interface HeliosTradingTerminalProps {
  isFullscreen?: boolean
}

export function HeliosTradingTerminal({ isFullscreen = false }: HeliosTradingTerminalProps) {
  const [mt5Data, setMT5Data] = useState<MT5Data | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'signals' | 'analytics'>('overview')
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showSensitiveData, setShowSensitiveData] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate realistic MT5 data
  const generateMT5Data = (): MT5Data => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.02
    const baseEquity = 250000
    const currentEquity = baseEquity * (1 + timeVariation)
    
    return {
      account_number: '12345678',
      balance: baseEquity,
      equity: currentEquity,
      margin: currentEquity * 0.15,
      free_margin: currentEquity * 0.85,
      profit: currentEquity - baseEquity,
      positions_count: Math.floor(Math.random() * 8) + 2,
      timestamp: new Date().toISOString()
    }
  }

  // Generate realistic trading positions
  const generatePositions = (): Position[] => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'EURJPY']
    const timeVariation = Date.now() % 100000 / 100000
    
    return symbols.slice(0, 3 + Math.floor(timeVariation * 5)).map((symbol, index) => {
      const isLong = Math.random() > 0.5
      const openPrice = 1.0500 + (Math.random() * 0.2)
      const currentPrice = openPrice + ((Math.random() - 0.5) * 0.01)
      const volume = (Math.random() * 2 + 0.1).toFixed(2)
      const profit = (currentPrice - openPrice) * parseFloat(volume) * 100000 * (isLong ? 1 : -1)
      
      return {
        ticket: 1000000 + index,
        symbol,
        type: isLong ? 'buy' : 'sell',
        volume: parseFloat(volume),
        open_price: openPrice,
        current_price: currentPrice,
        profit: profit,
        swap: Math.random() * 10 - 5,
        commission: Math.random() * 5,
        comment: 'Helios AI Signal',
        open_time: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    })
  }

  // Generate AI trading signals
  const generateSignals = (): TradingSignal[] => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'SPX500']
    const actions = ['buy', 'sell', 'close'] as const
    const timeVariation = Date.now() % 100000 / 100000
    
    return symbols.slice(0, 2 + Math.floor(timeVariation * 3)).map((symbol, index) => {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const confidence = 75 + Math.random() * 20
      const entryPrice = 1.0500 + (Math.random() * 0.2)
      
      return {
        id: `signal-${index}-${Date.now()}`,
        symbol,
        action,
        confidence: Math.floor(confidence),
        entry_price: entryPrice,
        stop_loss: entryPrice * (action === 'buy' ? 0.995 : 1.005),
        take_profit: entryPrice * (action === 'buy' ? 1.01 : 0.99),
        risk_reward: 2.0 + Math.random(),
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: Math.random() > 0.7 ? 'executed' : Math.random() > 0.3 ? 'pending' : 'cancelled',
        reasoning: `AI detected ${confidence.toFixed(0)}% probability ${action} signal based on momentum analysis and market microstructure patterns.`
      }
    })
  }

  const refreshData = async () => {
    try {
      setLoading(true)
      setLastUpdate(new Date())
      
      // Simulate API calls to MT5 system
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMT5Data(generateMT5Data())
      setPositions(generatePositions())
      setSignals(generateSignals())
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to refresh trading data:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshData, 5000) // Update every 5 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'text-green-400 bg-green-900/20'
      case 'pending': return 'text-yellow-400 bg-yellow-900/20'
      case 'cancelled': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'positions', name: 'Positions', icon: Target },
    { id: 'signals', name: 'AI Signals', icon: Zap },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ]

  return (
    <div className={`bg-gray-900 text-white ${isFullscreen ? 'h-screen' : 'h-[800px]'} flex flex-col`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="text-sm text-gray-400">
              Last Update: {formatTime(lastUpdate.toISOString())}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title={showSensitiveData ? "Hide Sensitive Data" : "Show Sensitive Data"}
            >
              {showSensitiveData ? (
                <EyeOff className="w-4 h-4 text-gray-300" />
              ) : (
                <Eye className="w-4 h-4 text-gray-300" />
              )}
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-700 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={autoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
            >
              {autoRefresh ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Account Summary */}
        {mt5Data && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Account</div>
              <div className="font-mono text-sm text-white">
                {showSensitiveData ? mt5Data.account_number : '••••••••'}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Balance</div>
              <div className="font-mono text-sm text-white">
                {showSensitiveData ? formatCurrency(mt5Data.balance) : '••••••'}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Equity</div>
              <div className="font-mono text-sm text-white">
                {showSensitiveData ? formatCurrency(mt5Data.equity) : '••••••'}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Profit</div>
              <div className={`font-mono text-sm ${mt5Data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {showSensitiveData ? formatCurrency(mt5Data.profit) : '••••••'}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Free Margin</div>
              <div className="font-mono text-sm text-white">
                {showSensitiveData ? formatCurrency(mt5Data.free_margin) : '••••••'}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Positions</div>
              <div className="font-mono text-sm text-white">
                {mt5Data.positions_count}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Daily P&L</h3>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {showSensitiveData ? formatCurrency(mt5Data?.profit || 0) : '••••••'}
                </div>
                <div className="text-sm text-gray-400">
                  {((mt5Data?.profit || 0) / (mt5Data?.balance || 1) * 100).toFixed(2)}% return
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Win Rate</h3>
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {(75 + Math.random() * 15).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">
                  Last 30 trades
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Risk Level</h3>
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {((mt5Data?.margin || 0) / (mt5Data?.equity || 1) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">
                  Margin utilization
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Recent Trading Activity</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {signals.slice(0, 5).map((signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          signal.action === 'buy' ? 'bg-green-900/30 text-green-400' : 
                          signal.action === 'sell' ? 'bg-red-900/30 text-red-400' : 
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {signal.action === 'buy' ? <TrendingUp className="h-4 w-4" /> : 
                           signal.action === 'sell' ? <TrendingDown className="h-4 w-4" /> : 
                           <Target className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">{signal.symbol}</div>
                          <div className="text-sm text-gray-400 capitalize">{signal.action} • {signal.confidence}% confidence</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                          {signal.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(signal.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'positions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Open Positions</h3>
              <div className="text-sm text-gray-400">
                {positions.length} active positions
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Open Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {positions.map((position) => (
                      <tr key={position.ticket} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-white">{position.symbol}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            position.type === 'buy' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            {position.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">{position.volume}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                          {showSensitiveData ? position.open_price.toFixed(5) : '•••••'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                          {showSensitiveData ? position.current_price.toFixed(5) : '•••••'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          <span className={position.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {showSensitiveData ? formatCurrency(position.profit) : '••••••'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatTime(position.open_time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'signals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AI Trading Signals</h3>
              <div className="text-sm text-gray-400">
                {signals.filter(s => s.status === 'pending').length} pending signals
              </div>
            </div>
            
            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        signal.action === 'buy' ? 'bg-green-900/30 text-green-400' : 
                        signal.action === 'sell' ? 'bg-red-900/30 text-red-400' : 
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {signal.action === 'buy' ? <TrendingUp className="h-5 w-5" /> : 
                         signal.action === 'sell' ? <TrendingDown className="h-5 w-5" /> : 
                         <Target className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">{signal.symbol}</div>
                        <div className="text-sm text-gray-400 capitalize">{signal.action} Signal • {signal.confidence}% Confidence</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                        {signal.status.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTime(signal.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-400">Entry Price</div>
                      <div className="font-mono text-sm text-white">
                        {showSensitiveData ? signal.entry_price.toFixed(5) : '•••••'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Stop Loss</div>
                      <div className="font-mono text-sm text-red-400">
                        {showSensitiveData ? signal.stop_loss.toFixed(5) : '•••••'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Take Profit</div>
                      <div className="font-mono text-sm text-green-400">
                        {showSensitiveData ? signal.take_profit.toFixed(5) : '•••••'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Risk/Reward</div>
                      <div className="font-mono text-sm text-blue-400">
                        1:{signal.risk_reward.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">AI Reasoning</div>
                    <div className="text-sm text-gray-300">{signal.reasoning}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Trades:</span>
                    <span className="text-white font-mono">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400 font-mono">76.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Win:</span>
                    <span className="text-green-400 font-mono">
                      {showSensitiveData ? '$285' : '•••'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Loss:</span>
                    <span className="text-red-400 font-mono">
                      {showSensitiveData ? '$142' : '•••'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Factor:</span>
                    <span className="text-blue-400 font-mono">2.84</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Drawdown:</span>
                    <span className="text-red-400 font-mono">-4.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharpe Ratio:</span>
                    <span className="text-blue-400 font-mono">2.84</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volatility:</span>
                    <span className="text-yellow-400 font-mono">8.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Beta:</span>
                    <span className="text-gray-300 font-mono">0.73</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">VaR (1-day):</span>
                    <span className="text-red-400 font-mono">
                      {showSensitiveData ? '$1,250' : '••••'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>MT5 {isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <span>•</span>
            <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
            <span>•</span>
            <span>Last update: {formatTime(lastUpdate.toISOString())}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Helios AI Trading System v2.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}