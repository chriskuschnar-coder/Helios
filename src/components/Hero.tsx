import { ArrowRight, Shield, TrendingUp, Users, BarChart3 } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-navy-50 to-white safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-6xl font-bold text-navy-900 leading-tight mb-4 md:mb-6">
              Quantitative Investment
              <span className="text-gold-600"> Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Global Market Consulting delivers revolutionary quantitative strategies through 
              advanced market microstructure analysis, processing 50,000+ tick-level events 
              per second for superior risk-adjusted returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
              <a href="/portal" className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 md:py-4 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center mobile-button active:scale-95">
                Client Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a href="#about" className="bg-white hover:bg-gray-50 text-navy-600 border border-navy-200 px-6 py-3 md:py-4 rounded-lg font-medium transition-colors duration-200 text-center mobile-button active:scale-95">
                Learn More
              </a>
            </div>
            
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-navy-600" />
                </div>
                <div className="font-serif text-lg md:text-2xl font-bold text-navy-900">$4.2M</div>
                <div className="text-xs md:text-sm text-gray-600">Assets Under Management</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-gold-600" />
                </div>
                <div className="font-serif text-lg md:text-2xl font-bold text-navy-900">22.4%</div>
                <div className="text-xs md:text-sm text-gray-600">Monthly Return (2025)</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-navy-600" />
                </div>
                <div className="font-serif text-lg md:text-2xl font-bold text-navy-900">3.12</div>
                <div className="text-xs md:text-sm text-gray-600">Sharpe Ratio</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 mobile-card">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg md:text-xl font-bold text-navy-900">Live Performance Metrics</h3>
                  <span className="text-sm md:text-base text-green-600 font-semibold">+287% Annual</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Max Drawdown</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-navy-600 h-2 rounded-full" style={{ width: '3.8%' }}></div>
                      </div>
                      <span className="text-sm font-medium">3.8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Profit Factor</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-gold-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">3.4:1</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm md:text-base text-gray-600">12,800+ Trades Executed</div>
                    <div className="text-xs text-gray-500 mt-1">Zero Account Blow-ups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}