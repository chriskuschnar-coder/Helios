import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Zap,
  Plus,
  AlertTriangle,
  Target,
  Clock
} from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { StripePayment } from './StripePayment'

export function HeliosDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [showFunding, setShowFunding] = useState(false)
  const [fundingAmount, setFundingAmount] = useState(1000)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleFundingSuccess = async (result: any) => {
    console.log('💰 Funding successful:', result)
    
    try {
      // Update account balance locally for immediate feedback
      if (account) {
        account.balance += result.amount
        account.available_balance += result.amount
        account.total_deposits += result.amount
      }
      
      // Refresh account data from server
      await refreshAccount()
      
      setShowFunding(false)
      setFundingAmount(1000)
    } catch (error) {
      console.error('Error updating account:', error)
    }
  }

  const handleFundingError = (error: string) => {
    console.error('Funding error:', error)
    alert('Payment failed: ' + error)
  }

  // Show empty state if no balance
  if (!account || account.balance === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Helios Trading Platform
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your trading account is ready. Add capital to start live trading with our quantitative algorithms.
            </p>
            <button
              onClick={() => setShowFunding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium inline-flex items-center text-lg"
            >
              <Plus className="h-6 w-6 mr-2" />
              Fund Trading Account
            </button>
          </div>

          {/* Simple Funding Modal */}
          {showFunding && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Trading Account</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trading Capital
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="100"
                      step="100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum: $100 for live trading</p>
                </div>

                {fundingAmount >= 100 && (
                  <StripePayment
                    amount={fundingAmount}
                    onSuccess={handleFundingSuccess}
                    onError={handleFundingError}
                  />
                )}

                <button
                  onClick={() => setShowFunding(false)}
                  className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Live trading data (mock)
  const tradingData = {
    accountBalance: account?.balance || 0,
    availableMargin: (account?.balance || 0) * 4, // 4:1 leverage
    dailyPnL: 2847.50,
    dailyPnLPct: 3.63,
    openPositions: 12,
    totalTrades: 847,
    winRate: 76.4,
    currentDrawdown: -1.2
  }

  const positions = [
    { symbol: 'SPY', side: 'LONG', size: 500, entry: 485.20, current: 487.85, pnl: 1325, pnlPct: 0.55 },
    { symbol: 'QQQ', side: 'SHORT', size: -200, entry: 412.50, current: 410.15, pnl: 470, pnlPct: 0.57 },
    { symbol: 'IWM', side: 'LONG', size: 300, entry: 218.75, current: 220.40, pnl: 495, pnlPct: 0.75 },
    { symbol: 'TSLA', side: 'SHORT', size: -50, entry: 248.90, current: 246.20, pnl: 135, pnlPct: 1.08 },
    { symbol: 'NVDA', side: 'LONG', size: 25, entry: 875.30, current: 892.15, pnl: 421, pnlPct: 1.92 }
  ]

  const recentTrades = [
    { time: '14:32:15', symbol: 'AAPL', side: 'BUY', size: 100, price: 185.42, pnl: 0, status: 'FILLED' },
    { time: '14:31:48', symbol: 'MSFT', side: 'SELL', size: 75, price: 412.88, pnl: 287, status: 'FILLED' },
    { time: '14:31:22', symbol: 'GOOGL', side: 'BUY', size: 25, price: 142.15, pnl: 0, status: 'FILLED' },
    { time: '14:30:55', symbol: 'AMZN', side: 'SELL', size: 50, price: 178.92, pnl: 445, status: 'FILLED' },
    { time: '14:30:33', symbol: 'META', side: 'BUY', size: 40, price: 485.67, pnl: 0, status: 'FILLED' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Account Balance</div>
            <div className="text-2xl font-bold text-white">${tradingData.accountBalance.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Available Margin</div>
            <div className="text-2xl font-bold text-blue-400">${tradingData.availableMargin.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Daily P&L</div>
            <div className="text-2xl font-bold text-green-400">+${tradingData.dailyPnL.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Daily %</div>
            <div className="text-2xl font-bold text-green-400">+{tradingData.dailyPnLPct}%</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Open Positions</div>
            <div className="text-2xl font-bold text-yellow-400">{tradingData.openPositions}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm flex items-center justify-between">
              <span>Add Capital</span>
              <Clock className="h-4 w-4" />
            </div>
            <button
              onClick={() => setShowFunding(true)}
              className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Fund
            </button>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Positions */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-400" />
                Live Positions
              </h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-center py-2">Side</th>
                      <th className="text-right py-2">Size</th>
                      <th className="text-right py-2">Entry</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">P&L</th>
                      <th className="text-right py-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 font-mono font-bold text-white">{position.symbol}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            position.side === 'LONG' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {position.side}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-gray-300">{Math.abs(position.size)}</td>
                        <td className="py-3 text-right font-mono text-gray-300">${position.entry}</td>
                        <td className="py-3 text-right font-mono text-white">${position.current}</td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl}
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          position.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {position.pnlPct >= 0 ? '+' : ''}{position.pnlPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trading Stats & Recent Trades */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                Trading Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white font-mono">{tradingData.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-mono">{tradingData.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-red-400 font-mono">{tradingData.currentDrawdown}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Leverage</span>
                  <span className="text-yellow-400 font-mono">4:1</span>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Recent Trades
              </h3>
              <div className="space-y-2">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 font-mono">{trade.time}</span>
                      <span className="font-mono font-bold text-white">{trade.symbol}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        trade.side === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {trade.side}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">${trade.price}</div>
                      {trade.pnl > 0 && (
                        <div className="text-green-400 font-mono text-xs">+${trade.pnl}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Market Data</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trading Engine</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Monitor</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Normal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Server Time</span>
                  <span className="text-white font-mono text-sm">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Funding Modal */}
        {showFunding && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Trading Account</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trading Capital
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="100"
                    step="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: $100 for live trading</p>
              </div>

              {fundingAmount >= 100 && (
                <StripePayment
                  amount={fundingAmount}
                  onSuccess={handleFundingSuccess}
                  onError={handleFundingError}
                />
              )}

              <button
                onClick={() => setShowFunding(false)}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}