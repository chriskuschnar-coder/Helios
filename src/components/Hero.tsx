import { ArrowRight, Shield, TrendingUp, Users, BarChart3 } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="relative pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 safe-area-top overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-32">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-500/30 mb-6">
              <span className="text-emerald-300 text-sm font-medium">🚀 Live Trading Platform</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Quantitative Investment
              <span className="bg-gradient-to-r from-gold-400 to-emerald-400 bg-clip-text text-transparent"> Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Global Market Consulting delivers revolutionary quantitative strategies through 
              advanced market microstructure analysis, processing 50,000+ tick-level events 
              per second for superior risk-adjusted returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <a href="/portal" className="group bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-glow transform hover:scale-105">
                Client Portal
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#about" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-center transform hover:scale-105">
                Learn More
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-white mb-1">$4.2M</div>
                <div className="text-sm text-slate-400">Assets Under Management</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-3">
                  <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-gold-400" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-white mb-1">22.4%</div>
                <div className="text-sm text-slate-400">Monthly Return (2025)</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-white mb-1">3.12</div>
                <div className="text-sm text-slate-400">Sharpe Ratio</div>
              </div>
            </div>
          </div>
          
          <div className="relative lg:flex lg:justify-end">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 mobile-card max-w-md mx-auto lg:mx-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg md:text-xl font-bold text-white">Live Performance Metrics</h3>
                  <span className="text-sm md:text-base text-emerald-400 font-semibold bg-emerald-500/20 px-3 py-1 rounded-full">+287% Annual</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-slate-300">Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-white/20 rounded-full h-3">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full shadow-glow" style={{ width: '76%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-white">76%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-slate-300">Max Drawdown</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-white/20 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full" style={{ width: '3.8%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-white">3.8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-slate-300">Profit Factor</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 md:w-24 bg-white/20 rounded-full h-3">
                        <div className="bg-gradient-to-r from-gold-400 to-gold-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-white">3.4:1</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-sm md:text-base text-slate-300 font-medium">12,800+ Trades Executed</div>
                    <div className="text-xs text-emerald-400 mt-1 font-semibold">Zero Account Blow-ups</div>
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