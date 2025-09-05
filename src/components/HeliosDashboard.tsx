import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import TickerTape from './TickerTape'
import { TradingViewBTCChart } from './TradingViewBTCChart'
import { PortfolioValueCard } from './PortfolioValueCard'
import { FundingModal } from './FundingModal'
import '../styles/funding.css'

interface DashboardData {
  account: {
    balance: number
    equity: number
    margin: number
    free_margin: number
    profit: number
    initial_balance: number
  }
  positions: Array<{
    ticket: string
    symbol: string
    type: string
    volume: number
    price_open: number
    price_current: number
    profit: number
    profit_pct: number
    time: string
    sl?: number
    tp?: number
  }>
  metrics: {
    win_rate: number
    profit_factor: number
    sharpe_ratio: number
    max_drawdown: number
    avg_win: number
    avg_loss: number
    sortino_ratio: number
    calmar_ratio: number
    information_ratio: number
    total_trades: number
  }
  risk_metrics: {
    var_daily: number
    var_weekly: number
    var_monthly: number
    leverage: number
    exposure_net: number
    position_concentration: number
  }
  execution_metrics: {
    avg_slippage: number
    fill_rate: number
    vwap_performance: number
    execution_cost: number
  }
  active_signals: Array<{
    time: string
    symbol: string
    type: string
    strategy: string
    confidence: number
  }>
  chart_data: {
    timestamps: number[]
    balance: number[]
    equity: number[]
  }
}

export function HeliosDashboard() {
  const { user, account, refreshAccount } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)
  const [prefilledAmount, setPrefilledAmount] = useState<number | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  // Mock data that matches the Python version exactly
  const generateMockData = (): DashboardData => {
    const currentBalance = account?.balance || 0
    const totalDeposits = account?.total_deposits || 0
    const netDeposits = totalDeposits - (account?.total_withdrawals || 0)
    
    // Calculate real P&L
    const totalPnL = currentBalance - netDeposits
    const dailyPnL = netDeposits > 0 ? totalPnL / 365 : 0
    
    return {
    account: {
      balance: currentBalance,
      equity: currentBalance + (netDeposits > 0 ? 5.177 : 0),
      margin: 0,
      free_margin: currentBalance,
      profit: netDeposits > 0 ? 50.40 : 0,
      initial_balance: netDeposits
    },
    positions: netDeposits > 0 ? [
      {
        ticket: 'BTC001',
        symbol: 'BTCUSD',
        type: 'BUY',
        volume: 0.25,
        price_open: 106000.00,
        price_current: 106010.00,
        profit: 2.50,
        profit_pct: 0.0094,
        time: '14:25:30',
        sl: 105500.00,
        tp: 107000.00
      },
      {
        ticket: 'ETH002',
        symbol: 'ETHUSD',
        type: 'SELL',
        volume: 2.5,
        price_open: 3200.00,
        price_current: 3192.00,
        profit: 20.00,
        profit_pct: 0.25,
        time: '13:45:12'
      }
    ] : [],
    metrics: {
      win_rate: netDeposits > 0 ? 76.4 : 0,
      profit_factor: netDeposits > 0 ? 3.40 : 0,
      sharpe_ratio: netDeposits > 0 ? 2.84 : 0,
      max_drawdown: netDeposits > 0 ? 4.2 : 0,
      avg_win: netDeposits > 0 ? 285.50 : 0,
      avg_loss: netDeposits > 0 ? 142.30 : 0,
      sortino_ratio: netDeposits > 0 ? 3.12 : 0,
      calmar_ratio: netDeposits > 0 ? 2.89 : 0,
      information_ratio: netDeposits > 0 ? 1.67 : 0,
      total_trades: netDeposits > 0 ? 847 : 0
    },
    risk_metrics: {
      var_daily: netDeposits > 0 ? 1250.00 : 0,
      var_weekly: netDeposits > 0 ? 2800.00 : 0,
      var_monthly: netDeposits > 0 ? 5600.00 : 0,
      leverage: netDeposits > 0 ? 2.4 : 0,
      exposure_net: netDeposits > 0 ? 33000.00 : 0,
      position_concentration: netDeposits > 0 ? 15.8 : 0
    },
    execution_metrics: {
      avg_slippage: netDeposits > 0 ? 0.0012 : 0,
      fill_rate: netDeposits > 0 ? 98.5 : 0,
      vwap_performance: netDeposits > 0 ? 0.15 : 0,
      execution_cost: netDeposits > 0 ? 0.0025 : 0
    },
    active_signals: netDeposits > 0 ? [
      {
        time: new Date().toLocaleTimeString(),
        symbol: 'BTCUSDT',
        type: 'BUY',
        strategy: 'Trend Following',
        confidence: 85
      },
      {
        time: new Date().toLocaleTimeString(),
        symbol: 'ETHUSD',
        type: 'SELL',
        strategy: 'Mean Reversion',
        confidence: 72
      }
    ] : [],
    chart_data: {
      timestamps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      balance: netDeposits > 0 ? [netDeposits, netDeposits * 1.01, netDeposits * 1.025, netDeposits * 1.032, netDeposits * 1.048, netDeposits * 1.052, netDeposits * 1.06, netDeposits * 1.058, currentBalance, currentBalance] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      equity: netDeposits > 0 ? [netDeposits, netDeposits * 1.01, netDeposits * 1.025, netDeposits * 1.032, netDeposits * 1.048, netDeposits * 1.052, netDeposits * 1.06, netDeposits * 1.058, currentBalance + 5, currentBalance + 5] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
    }
  }

  useEffect(() => {
    setData(generateMockData())
  }, [account])

  const openFunding = (amount: number | null = null) => {
    setPrefilledAmount(amount)
    setShowFundingModal(true)
  }

  const handleFundingSuccess = () => {
    setShowFundingModal(false)
    setPrefilledAmount(null)
    refreshAccount()
  }

  const handleProceedToPayment = (amount: number, method: string) => {
    setShowFundingModal(false)
    // Here you would integrate with your existing payment processor
    console.log('Proceeding to payment:', { amount, method })
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading HELIOS CAPITAL...</div>
          <div className="text-sm text-gray-400">Initializing trading systems</div>
        </div>
      </div>
    )
  }

  // Calculate derived values
  const dailyPnl = data.account.balance - data.account.initial_balance
  const dailyPnlPct = (dailyPnl / data.account.initial_balance) * 100
  const initialInvestment = 8000
  const totalGrowth = data.account.balance - initialInvestment
  const growthPct = (totalGrowth / initialInvestment) * 100

  return (
    <div className="min-h-screen bg-gray-900 safe-area-bottom">
      {/* TradingView Ticker Tape */}
      <div className="bg-gray-800 border-b border-gray-700">
        <TickerTape />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* Account Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-6 hover:border-gray-600 transition-colors mobile-card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 md:mb-2 font-semibold">
              Account Balance
            </div>
            <div className="text-lg md:text-2xl font-bold text-white font-mono">
              ${data.account.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className={`text-xs md:text-sm mt-1 md:mt-2 font-medium flex items-center gap-1 ${dailyPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnl >= 0 ? '+' : ''}${Math.abs(dailyPnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({dailyPnlPct >= 0 ? '+' : ''}{dailyPnlPct.toFixed(2)}%)
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-6 hover:border-gray-600 transition-colors mobile-card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 md:mb-2 font-semibold">
              Account Equity
            </div>
            <div className="text-lg md:text-2xl font-bold text-white font-mono">
              ${data.account.equity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className={`text-xs md:text-sm mt-1 md:mt-2 font-medium ${data.account.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.account.profit >= 0 ? '+' : ''}${Math.abs(data.account.profit).toFixed(2)} P&L
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-6 hover:border-gray-600 transition-colors mobile-card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 md:mb-2 font-semibold">
              Free Margin
            </div>
            <div className="text-lg md:text-2xl font-bold text-white font-mono">
              ${data.account.free_margin.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="text-xs md:text-sm mt-1 md:mt-2 text-gray-400">
              Available for trading
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-6 hover:border-gray-600 transition-colors mobile-card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 md:mb-2 font-semibold">
              Portfolio Return
            </div>
            <div className={`text-lg md:text-2xl font-bold font-mono ${totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGrowth >= 0 ? '+' : ''}${Math.abs(totalGrowth).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className={`text-xs md:text-sm mt-1 md:mt-2 font-medium ${totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGrowth >= 0 ? '+' : ''}{growthPct.toFixed(2)}%
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 mb-6 md:mb-8 mobile-card">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 md:mb-4 font-semibold">
            Performance Metrics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Win Rate</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">{data.metrics.win_rate.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Profit Factor</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">{data.metrics.profit_factor.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Sharpe Ratio</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">{data.metrics.sharpe_ratio.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Max Drawdown</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">{data.metrics.max_drawdown.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Avg Win</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">${data.metrics.avg_win.toFixed(0)}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-700">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Avg Loss</span>
              <div className="text-sm md:text-lg font-bold text-white font-mono">${data.metrics.avg_loss.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Live BTC Chart */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-white text-base md:text-lg font-semibold mb-3 md:mb-4">Bitcoin Live Chart</h3>
          <TradingViewBTCChart />
        </div>
        
        {/* Open Positions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6 md:mb-8 mobile-card">
          <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-700 bg-gray-900">
            <h3 className="text-xs md:text-sm font-semibold text-white uppercase tracking-wider">Open Positions</h3>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Ticket</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Volume</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Entry</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Current</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">P&L</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">P&L %</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.length > 0 ? (
                  data.positions.map((position, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-300 font-mono">{position.ticket}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white font-semibold">{position.symbol}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          position.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {position.type}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-300 font-mono">{position.volume.toFixed(2)}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-300 font-mono">${position.price_open.toFixed(2)}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white font-mono">${position.price_current.toFixed(2)}</td>
                      <td className={`px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono font-semibold ${
                        position.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                      </td>
                      <td className={`px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono font-semibold ${
                        position.profit_pct >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.profit_pct >= 0 ? '+' : ''}{position.profit_pct.toFixed(2)}%
                      </td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-400 font-mono">{position.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-2 md:px-6 py-6 md:py-8 text-center text-gray-500 text-sm">
                      No open positions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Active Signals */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6 md:mb-8 mobile-card">
          <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-700 bg-gray-900">
            <h3 className="text-xs md:text-sm font-semibold text-white uppercase tracking-wider">Active Trading Signals</h3>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Strategy</th>
                  <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.active_signals.length > 0 ? (
                  data.active_signals.map((signal, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-300 font-mono">{signal.time}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white font-semibold">{signal.symbol}</td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          signal.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {signal.type}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-300">{signal.strategy}</td>
                      <td className={`px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono font-semibold ${
                        signal.confidence > 75 ? 'text-green-400' : signal.confidence > 50 ? 'text-gray-300' : 'text-red-400'
                      }`}>
                        {signal.confidence}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-2 md:px-6 py-6 md:py-8 text-center text-gray-500 text-sm">
                      No active signals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
          
      {/* Funding Modal */}
      <FundingModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        prefilledAmount={prefilledAmount}
        onProceedToPayment={handleProceedToPayment}
      />
    </div>
  )
}