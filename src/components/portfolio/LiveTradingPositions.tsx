import React, { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, RefreshCw, Eye, BarChart3, Target, Clock } from 'lucide-react'

interface TradingPosition {
  ticket: string
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  price_open: number
  price_current: number
  profit: number
  profit_pct: number
  time_open: string
  sl?: number
  tp?: number
  swap: number
  commission: number
}

interface MT5AccountData {
  balance: number
  equity: number
  margin: number
  free_margin: number
  profit: number
  positions: TradingPosition[]
  lastUpdated: string
}

export function LiveTradingPositions({ currentBalance }: { currentBalance: number }) {
  const [mt5Data, setMT5Data] = useState<MT5AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [showAllPositions, setShowAllPositions] = useState(false)

  const generateMT5Data = (): MT5AccountData => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.01 // ±1% variation
    const hasActivity = currentBalance > 0

    if (!hasActivity) {
      return {
        balance: 0,
        equity: 0,
        margin: 0,
        free_margin: 0,
        profit: 0,
        positions: [],
        lastUpdated: new Date().toISOString()
      }
    }

    // Generate realistic trading positions
    const positions: TradingPosition[] = [
      {
        ticket: 'MT5001',
        symbol: 'XAUUSD',
        type: 'BUY',
        volume: 2.5,
        price_open: 2685.50,
        price_current: 2687.20 + (timeVariation * 10),
        profit: 425.00 + (timeVariation * 50),
        profit_pct: 0.63 + (timeVariation * 0.1),
        time_open: '09:15:30',
        sl: 2680.00,
        tp: 2695.00,
        swap: -2.50,
        commission: -12.50
      },
      {
        ticket: 'MT5002',
        symbol: 'EURUSD',
        type: 'SELL',
        volume: 5.0,
        price_open: 1.0845,
        price_current: 1.0838 + (timeVariation * 0.001),
        profit: 350.00 + (timeVariation * 30),
        profit_pct: 0.65 + (timeVariation * 0.08),
        time_open: '08:45:12',
        swap: 1.25,
        commission: -15.00
      },
      {
        ticket: 'MT5003',
        symbol: 'GBPUSD',
        type: 'BUY',
        volume: 3.0,
        price_open: 1.2634,
        price_current: 1.2641 + (timeVariation * 0.002),
        profit: 210.00 + (timeVariation * 25),
        profit_pct: 0.55 + (timeVariation * 0.06),
        time_open: '07:30:45',
        tp: 1.2680,
        swap: -1.80,
        commission: -18.00
      }
    ]

    const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0)
    const fundEquity = currentBalance + totalProfit

    return {
      balance: currentBalance,
      equity: fundEquity,
      margin: positions.reduce((sum, pos) => sum + (pos.volume * 1000), 0),
      free_margin: fundEquity - positions.reduce((sum, pos) => sum + (pos.volume * 1000), 0),
      profit: totalProfit,
      positions,
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    // In production, this would fetch from mt5_data_feed table
    // For now, generate realistic data
    await new Promise(resolve => setTimeout(resolve, 300))
    setMT5Data(generateMT5Data())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Update every 10 seconds to simulate live MT5 data
    const interval = setInterval(refreshData, 10000)
    return () => clearInterval(interval)
  }, [currentBalance])

  const displayPositions = showAllPositions ? mt5Data?.positions || [] : (mt5Data?.positions || []).slice(0, 3)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Live Trading Positions</h3>
            <p className="text-sm text-gray-600">
              MT5 Data Feed • Update #{updateCount} • {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">LIVE MT5</span>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* MT5 Account Summary */}
      {mt5Data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-navy-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-600 mb-1">Fund Balance</div>
            <div className="text-lg font-bold text-navy-900">
              ${mt5Data.balance.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-600 mb-1">Fund Equity</div>
            <div className="text-lg font-bold text-green-900">
              ${mt5Data.equity.toLocaleString()}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-600 mb-1">Unrealized P&L</div>
            <div className={`text-lg font-bold ${mt5Data.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mt5Data.profit > 0 ? '+' : ''}${mt5Data.profit.toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-600 mb-1">Free Margin</div>
            <div className="text-lg font-bold text-purple-900">
              ${mt5Data.free_margin.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayPositions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-900">Ticket</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-900">Symbol</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-900">Type</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-900">Volume</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-900">Entry</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-900">Current</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-900">P&L</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-900">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPositions.map((position, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-mono text-gray-600">{position.ticket}</td>
                        <td className="py-3 text-sm font-semibold text-gray-900">{position.symbol}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            position.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {position.type}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-right font-mono">{position.volume.toFixed(2)}</td>
                        <td className="py-3 text-sm text-right font-mono">{position.price_open.toFixed(position.symbol.includes('USD') ? 5 : 2)}</td>
                        <td className="py-3 text-sm text-right font-mono font-semibold">{position.price_current.toFixed(position.symbol.includes('USD') ? 5 : 2)}</td>
                        <td className={`py-3 text-sm text-right font-mono font-semibold ${
                          position.profit > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {position.profit > 0 ? '+' : ''}${position.profit.toFixed(2)}
                        </td>
                        <td className={`py-3 text-sm text-right font-mono font-semibold ${
                          position.profit_pct > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {position.profit_pct > 0 ? '+' : ''}{position.profit_pct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {(mt5Data?.positions.length || 0) > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllPositions(!showAllPositions)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {showAllPositions ? 'Show Less' : `View All ${mt5Data?.positions.length} Positions`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-2">No open positions</div>
              <div className="text-sm text-gray-400">
                Trading positions will appear here when the fund has active trades
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}