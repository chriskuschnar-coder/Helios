import { useState } from 'react'

export function Performance() {
  const [selectedPeriod, setSelectedPeriod] = useState('Live')

  const periods = ['Live', '2024', 'Inception']
  
  const performanceData = {
    'Live': { return: '22.4%', sharpe: '3.12', drawdown: '3.8%', winRate: '76%', period: '2025 YTD' },
    '2024': { return: '342%', sharpe: '2.94', drawdown: '5.7%', winRate: '74%', period: 'Full Year' },
    'Inception': { return: '1,247%', sharpe: '2.89', drawdown: '6.8%', winRate: '73%', period: 'Since Launch' }
  }

  const currentData = performanceData[selectedPeriod as keyof typeof performanceData]

  return (
    <section id="performance" className="py-20 bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 text-center mb-16">
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <span className="text-emerald-300 text-sm font-semibold">TRACK RECORD</span>
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-white mb-6">
            Quantitative Performance Track Record
          </h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Live trading results demonstrating consistent alpha generation through 
            mathematical models and systematic risk management across multiple market cycles.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-white text-navy-900 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-emerald-400 mb-3">
                {currentData.return}
              </div>
              <div className="text-slate-300 font-semibold text-lg">
                {selectedPeriod === 'Live' ? 'Monthly Return' : 'Annual Return'}
              </div>
              <div className="text-sm text-slate-400">
                {selectedPeriod === 'Live' ? 'YTD Average' : currentData.period}
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-blue-400 mb-3">
                {currentData.sharpe}
              </div>
              <div className="text-slate-300 font-semibold text-lg">Sharpe Ratio</div>
              <div className="text-sm text-slate-400">Risk-adjusted</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-gold-400 mb-3">
                {currentData.drawdown}
              </div>
              <div className="text-slate-300 font-semibold text-lg">Max Drawdown</div>
              <div className="text-sm text-slate-400">Capital preservation</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-emerald-400 mb-3">
                {currentData.winRate}
              </div>
              <div className="text-slate-300 font-semibold text-lg">Win Rate</div>
              <div className="text-sm text-slate-400">8,400+ trades</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h4 className="font-display text-xl font-bold text-white mb-6">
              Multi-Account Performance Summary
            </h4>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-white mb-2">6</div>
                <div className="text-slate-300 font-medium">Institutional Accounts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">$4.2M</div>
                <div className="text-slate-300 font-medium">Assets Under Management</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
                <div className="text-slate-300 font-medium">Profitable Accounts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">0</div>
                <div className="text-slate-300 font-medium">Account Blow-ups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantitative Metrics */}
        <div className="relative z-10 mt-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
          <h3 className="font-display text-2xl lg:text-4xl font-bold text-white mb-12 text-center">
            Advanced Quantitative Metrics
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gold-400 mb-3">3.4:1</div>
              <div className="text-slate-300 font-semibold text-lg">Profit Factor</div>
              <div className="text-sm text-slate-400 mt-1">Winners vs Losers</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-emerald-400 mb-3">0.28</div>
              <div className="text-slate-300 font-semibold text-lg">Kelly Fraction</div>
              <div className="text-sm text-slate-400 mt-1">Optimal Position Size</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-3">52%</div>
              <div className="text-slate-300 font-semibold text-lg">Slippage Reduction</div>
              <div className="text-sm text-slate-400 mt-1">vs TWAP Benchmark</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}