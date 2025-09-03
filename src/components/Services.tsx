import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp } from 'lucide-react'

export function Services() {
  const services = [
    {
      icon: Brain,
      title: 'Alpha Fund',
      description: 'Quantitative momentum strategies with 35-45% annual target returns and <10% volatility.',
      features: ['$250K minimum', '2% management fee', '20% performance fee', '6-month lock-up'],
      gradient: 'from-purple-500 to-indigo-600',
      accent: 'purple'
    },
    {
      icon: Shield,
      title: 'Market Neutral',
      description: 'Statistical arbitrage and relative value strategies for consistent risk-adjusted returns.',
      features: ['15-20% annual target', '3% max drawdown', 'Family office focused', 'Quarterly liquidity'],
      gradient: 'from-emerald-500 to-teal-600',
      accent: 'emerald'
    },
    {
      icon: TrendingUp,
      title: 'Momentum Portfolio',
      description: 'High-conviction quantitative signals with up to 3x leverage during optimal conditions.',
      features: ['60-80% annual target', '15-20% volatility', 'Sophisticated investors', 'Dynamic leverage'],
      gradient: 'from-blue-500 to-cyan-600',
      accent: 'blue'
    },
    {
      icon: Zap,
      title: 'Risk Management',
      description: 'Advanced portfolio construction using modern portfolio theory and multi-factor models.',
      features: ['VaR modeling', 'Stress testing', 'Factor attribution', 'Real-time monitoring'],
      gradient: 'from-gold-500 to-orange-600',
      accent: 'gold'
    }
  ]

  return (
    <>
      {/* Investment Products Section */}
      <section id="services" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-navy-100 rounded-full mb-6">
              <span className="text-navy-700 text-sm font-semibold">INVESTMENT PRODUCTS</span>
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
              Quantitative Investment Products
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Sophisticated mathematical models designed for institutional investors 
              and qualified individuals seeking superior risk-adjusted returns through 
              systematic market inefficiency exploitation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.gradient}"></div>
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-4 text-center">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-6 text-center leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-slate-600">
                      <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-3 flex-shrink-0`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Market Microstructure Analytics Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-slate-800 to-navy-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <span className="text-emerald-300 text-sm font-semibold">ADVANCED ANALYTICS</span>
            </div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-white mb-6">
              Advanced Market Microstructure Analytics
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Our proprietary quantitative models implement cutting-edge academic research 
              for systematic alpha generation and superior risk management through mathematical precision.
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-glow">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                VPIN Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Volume-Synchronized Probability of Informed Trading with machine learning 
                enhancement calibrated on 119,000+ trade samples for toxic flow identification 
                and adverse selection prevention.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-glow">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Kyle's Lambda
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Dynamic price impact modeling with Hasbrouck decomposition for 
                optimal execution algorithms, achieving 52% slippage reduction 
                versus time-weighted average price benchmarks.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-glow">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Regime Detection
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Four-state Hidden Markov Models with Baum-Welch parameter estimation 
                for real-time market state identification and probabilistic forecasting 
                across momentum and mean-reversion regimes.
              </p>
            </div>
          </div>

          {/* Proprietary Quantitative Framework */}
          <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20">
            <h3 className="font-display text-2xl lg:text-4xl font-bold text-white mb-12 text-center">
              Proprietary Quantitative Framework
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h4 className="font-display text-xl font-bold text-white mb-6">
                  Statistical Arbitrage Models
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-emerald-300">Ornstein-Uhlenbeck Process</div>
                      <div className="text-sm text-slate-400 mt-1">Mean reversion modeling with stochastic differential equations</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-blue-300">Johansen Cointegration</div>
                      <div className="text-sm text-slate-400 mt-1">Statistical pairs identification through vector error correction</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-purple-300">Dynamic Hedge Ratios</div>
                      <div className="text-sm text-slate-400 mt-1">Principal component analysis for multi-factor risk exposure</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-gold-400 to-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gold-300">Fair Value Estimation</div>
                      <div className="text-sm text-slate-400 mt-1">Mean reversion strategies around theoretical price levels</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h4 className="font-display text-xl font-bold text-white mb-6">
                  Market Maker Inventory Risk
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-emerald-300">Glosten-Milgrom Sequential Models</div>
                      <div className="text-sm text-slate-400 mt-1">Adverse selection prevention through informed trading detection</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-blue-300">Amihud-Mendelson Decomposition</div>
                      <div className="text-sm text-slate-400 mt-1">Bid-ask spread analysis for liquidity cost optimization</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-purple-300">Ho-Stoll Dealer Framework</div>
                      <div className="text-sm text-slate-400 mt-1">Market maker positioning and inventory risk management</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-3 h-3 bg-gradient-to-r from-gold-400 to-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold text-gold-300">Queue Position Optimization</div>
                      <div className="text-sm text-slate-400 mt-1">Advanced algorithms for optimal order placement and execution</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}