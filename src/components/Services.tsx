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
    <section id="performance" className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4">
            Proven Track Record of Investment Success
          </h2>
          <p className="text-xl text-navy-200 max-w-3xl mx-auto">
            through disciplined investment strategies and professional risk management across all market conditions.
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                    selectedPeriod === period
                      ? 'bg-navy-600 text-white'
                      : 'text-gray-600 hover:text-navy-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-green-600 mb-2">
                {currentData.return}
              </div>
              <div className="text-gray-600 font-medium">
                {selectedPeriod === 'Live' ? 'Monthly Return' : 'Annual Return'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPeriod === 'Live' ? 'YTD Average' : currentData.period}
              </div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-navy-900 mb-2">
                {currentData.sharpe}
              </div>
              <div className="text-gray-600 font-medium">Sharpe Ratio</div>
              <div className="text-sm text-gray-500">Risk-adjusted</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-gold-600 mb-2">
                {currentData.drawdown}
              </div>
              <div className="text-gray-600 font-medium">Max Drawdown</div>
              <div className="text-sm text-gray-500">Capital preservation</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-green-600 mb-2">
                {currentData.winRate}
              </div>
              <div className="text-gray-600 font-medium">Win Rate</div>
              <div className="text-sm text-gray-500">8,400+ trades</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-serif text-lg font-bold text-navy-900 mb-4">
              Multi-Account Performance Summary
            </h4>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold text-navy-900 mb-1">6</div>
                <div className="text-gray-600">Institutional Accounts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900 mb-1">$4.2M</div>
                <div className="text-gray-600">Assets Under Management</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-gray-600">Profitable Accounts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-900 mb-1">0</div>
                <div className="text-gray-600">Account Blow-ups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantitative Metrics */}
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 lg:p-12">
          <h3 className="font-serif text-2xl font-bold text-navy-900 mb-8 text-center">
            Investment Performance Summary
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400 mb-2">Zero</div>
              <div className="text-gray-700 font-medium">Principal Losses</div>
              <div className="text-sm text-gray-600 mt-1">Consistent Capital Preservation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400 mb-2">3.4:1</div>
              <div className="text-gray-700 font-medium">Profit Factor</div>
              <div className="text-sm text-gray-600 mt-1">Winners vs Losers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-400 mb-2">99.97%</div>
              <div className="text-gray-700 font-medium">System Uptime</div>
              <div className="text-sm text-gray-600 mt-1">Reliable Operations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}