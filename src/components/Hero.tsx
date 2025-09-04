import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Elite Investment
            <span className="block text-gold-400">Management</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-navy-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Institutional-grade portfolio management delivering consistent 
            superior risk-adjusted returns.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              Client Portal
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-gold-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">342%</div>
              <div className="text-navy-200">2024 Returns</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Shield className="w-8 h-8 text-gold-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">2.94</div>
              <div className="text-navy-200">Sharpe Ratio</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-gold-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">$4.2M</div>
              <div className="text-navy-200">Assets Under Management</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}