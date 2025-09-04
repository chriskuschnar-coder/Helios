import { ArrowRight, TrendingUp, Shield, Award } from 'lucide-react'

export function Hero() {
  const handleClientPortalClick = () => {
    window.location.href = '/'
  }

  return (
    <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Award className="w-6 h-6 text-gold-400" />
              <span className="text-gold-400 font-medium">Award-Winning Investment Management</span>
            </div>
            
            <h1 className="font-serif text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Institutional-Grade
              <span className="block text-gold-400">Investment Strategies</span>
            </h1>
            
            <p className="text-xl text-navy-200 mb-8 leading-relaxed">
              Access sophisticated quantitative trading strategies previously reserved for 
              institutional investors. Our proven track record delivers consistent returns 
              through advanced risk management and market-neutral approaches.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors duration-200 group"
              >
                Learn More
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <button
                onClick={handleClientPortalClick}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-900 transition-colors duration-200"
              >
                Client Portal
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-gold-400 mb-1">342%</div>
                <div className="text-sm text-navy-300">2024 Returns</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-gold-400 mb-1">2.94</div>
                <div className="text-sm text-navy-300">Sharpe Ratio</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-bold text-gold-400 mb-1">5.7%</div>
                <div className="text-sm text-navy-300">Max Drawdown</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold">Live Performance</h3>
                <div className="flex items-center space-x-2 text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">+22.4%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-navy-200">Monthly Return</span>
                  <span className="font-semibold text-green-400">+22.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-200">Win Rate</span>
                  <span className="font-semibold">76%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-200">Risk Score</span>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Low</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-navy-200">Assets Under Management</span>
                  <span className="font-semibold">$4.2M</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-sm text-navy-300 mb-1">Next Strategy Deployment</div>
                  <div className="font-semibold text-gold-400">Q2 2025</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-gold-500 text-navy-900 px-4 py-2 rounded-lg font-semibold text-sm">
              Live Trading
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
              Verified Results
            </div>
          </div>
        </div>
      </div>
    </section>
  )
  )
}