import { TrendingUp, Shield, BarChart3, Target, Zap, Award } from 'lucide-react'

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Investment Strategies & Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sophisticated quantitative strategies designed to generate consistent alpha 
            while managing downside risk through systematic portfolio optimization.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-navy-600 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">
              Quantitative Alpha Generation
            </h3>
            <p className="text-gray-600 mb-6">
              Systematic strategies that exploit market inefficiencies through advanced 
              mathematical models and machine learning algorithms.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Cross-sectional momentum strategies
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Statistical arbitrage models
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Mean reversion algorithms
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-navy-600 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">
              Advanced Risk Management
            </h3>
            <p className="text-gray-600 mb-6">
              Institutional-grade risk controls and portfolio optimization techniques 
              to preserve capital while maximizing risk-adjusted returns.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Dynamic position sizing
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Volatility targeting
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Drawdown protection
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-navy-600 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-4">
              Portfolio Optimization
            </h3>
            <p className="text-gray-600 mb-6">
              Continuous portfolio rebalancing using modern portfolio theory 
              and factor-based allocation models.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Factor-based allocation
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Correlation analysis
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-navy-600 rounded-full mr-3"></div>
                Regime detection
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-navy-900 rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-navy-200 mb-8 max-w-2xl mx-auto">
            Join sophisticated investors who trust our quantitative approach 
            to generate consistent alpha in all market conditions.
          </p>
          <button className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
            Schedule Consultation
          </button>
        </div>
      </div>
    </section>
  )
}