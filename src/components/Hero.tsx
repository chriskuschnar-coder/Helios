import { TrendingUp, ArrowRight, Shield, Award } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-navy-900" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gold-600 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-navy-900" />
            </div>
          </div>
          
          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Quantitative Excellence in
            <span className="block text-gold-400">Investment Management</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-navy-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Advanced mathematical models and systematic strategies delivering superior 
            risk-adjusted returns for sophisticated investors through institutional-grade 
            portfolio management and cutting-edge market microstructure analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="bg-gold-600 hover:bg-gold-700 text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 group">
              Start Your Investment Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
              View Performance Track Record
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">SEC Registered</h3>
              <p className="text-navy-200">Fully compliant investment advisor with institutional-grade oversight</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Proven Track Record</h3>
              <p className="text-navy-200">342% returns in 2024 with superior risk management across all strategies</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-gold-400" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Quantitative Edge</h3>
              <p className="text-navy-200">Proprietary algorithms processing 50,000+ market events per second</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}