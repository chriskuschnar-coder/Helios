import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { TrendingUp, DollarSign, Activity, BarChart3, Plus, Minus, Settings, Bell, LogOut } from 'lucide-react'
import { CSSTickerTape } from './CSSTickerTape'
import { TradingViewBTCChart } from './TradingViewBTCChart'
import { PortfolioValueCard } from './PortfolioValueCard'

export function HeliosDashboard() {
  const { user, account, signOut } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)

  const handleFundPortfolio = (amount?: number) => {
    setShowFundingModal(true)
  }

  const handleWithdraw = () => {
    console.log('Withdraw clicked')
  }

  const currentBalance = account?.balance || 0
  const dailyPnL = 2847.32
  const dailyPnLPercent = 3.42
  const isPositive = dailyPnL >= 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Ticker Tape */}
      <CSSTickerTape />
      
      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 min-h-screen p-6">
          {/* Portfolio Value Card */}
          <div className="mb-6">
            <PortfolioValueCard 
              onFundPortfolio={handleFundPortfolio}
              onWithdraw={handleWithdraw}
            />
          </div>

          {/* Account Stats */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">ACCOUNT PERFORMANCE</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Today's P&L</span>
                <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}${Math.abs(dailyPnL).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Daily Return</span>
                <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{dailyPnLPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Win Rate</span>
                <span className="text-white font-bold">76.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sharpe Ratio</span>
                <span className="text-white font-bold">2.84</span>
              </div>
            </div>
          </div>

          {/* Active Positions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-4">ACTIVE POSITIONS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">BTC/USD</div>
                  <div className="text-xs text-gray-400">Long • 0.25 BTC</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+$1,247</div>
                  <div className="text-xs text-gray-400">+2.8%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">ETH/USD</div>
                  <div className="text-xs text-gray-400">Long • 2.5 ETH</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+$892</div>
                  <div className="text-xs text-gray-400">+4.1%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">SPY</div>
                  <div className="text-xs text-gray-400">Long • 50 shares</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold">-$156</div>
                  <div className="text-xs text-gray-400">-0.6%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="flex-1 p-6">
          {/* Top Stats Bar */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Portfolio Value</div>
                  <div className="text-white text-xl font-bold">${currentBalance.toLocaleString()}</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Daily P&L</div>
                  <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}${Math.abs(dailyPnL).toLocaleString()}
                  </div>
                </div>
                <TrendingUp className={`h-8 w-8 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Open Positions</div>
                  <div className="text-white text-xl font-bold">12</div>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Available Cash</div>
                  <div className="text-white text-xl font-bold">${(currentBalance * 0.3).toLocaleString()}</div>
                </div>
                <Activity className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Trading Chart */}
          <div className="mb-6">
            <TradingViewBTCChart />
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Side</th>
                    <th className="text-right py-2">Size</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">P&L</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-t border-gray-700">
                    <td className="py-3 text-gray-400">14:32:15</td>
                    <td className="py-3">BTC/USD</td>
                    <td className="py-3 text-green-400">BUY</td>
                    <td className="py-3 text-right">0.05</td>
                    <td className="py-3 text-right">$106,250</td>
                    <td className="py-3 text-right text-green-400">+$247</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-3 text-gray-400">14:28:42</td>
                    <td className="py-3">ETH/USD</td>
                    <td className="py-3 text-red-400">SELL</td>
                    <td className="py-3 text-right">1.2</td>
                    <td className="py-3 text-right">$3,195</td>
                    <td className="py-3 text-right text-green-400">+$156</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="py-3 text-gray-400">14:15:33</td>
                    <td className="py-3">SPY</td>
                    <td className="py-3 text-green-400">BUY</td>
                    <td className="py-3 text-right">25</td>
                    <td className="py-3 text-right">$597.50</td>
                    <td className="py-3 text-right text-red-400">-$89</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}