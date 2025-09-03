import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp } from 'lucide-react'

export function Services() {
  const services = [
    {
      icon: Brain,
      title: 'Alpha Fund',
      description: 'Quantitative momentum strategies with 35-45% annual target returns and <10% volatility.',
      features: ['$250K minimum', '2% management fee', '20% performance fee', '6-month lock-up']
    },
    {
      icon: Shield,
      title: 'Market Neutral',
      description: 'Statistical arbitrage and relative value strategies for consistent risk-adjusted returns.',
      features: ['15-20% annual target', '3% max drawdown', 'Family office focused', 'Quarterly liquidity']
    },
    {
      icon: TrendingUp,
      title: 'Momentum Portfolio',
      description: 'High-conviction quantitative signals with up to 3x leverage during optimal conditions.',
      features: ['60-80% annual target', '15-20% volatility', 'Sophisticated investors', 'Dynamic leverage']
    },
    {
      icon: Zap,
      title: 'Risk Management',
      description: 'Advanced portfolio construction using modern portfolio theory and multi-factor models.',
      features: ['VaR modeling', 'Stress testing', 'Factor attribution', 'Real-time monitoring']
    }
  ]

  return (
    <>
      {/* Investment Products Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Quantitative Investment Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sophisticated mathematical models designed for institutional investors 
              and qualified individuals seeking superior risk-adjusted returns through 
              systematic market inefficiency exploitation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 group hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors duration-200">
                    <service.icon className="h-6 w-6 text-navy-600" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gold-600 rounded-full mr-2"></div>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Advanced Market Microstructure Analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proprietary quantitative models implement cutting-edge academic research 
              for systematic alpha generation and superior risk management through mathematical precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                VPIN Analysis
              </h3>
              <p className="text-gray-600">
                Volume-Synchronized Probability of Informed Trading with machine learning 
                enhancement calibrated on 119,000+ trade samples for toxic flow identification 
                and adverse selection prevention.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Kyle's Lambda
              </h3>
              <p className="text-gray-600">
                Dynamic price impact modeling with Hasbrouck decomposition for 
                optimal execution algorithms, achieving 52% slippage reduction 
                versus time-weighted average price benchmarks.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Regime Detection
              </h3>
              <p className="text-gray-600">
                Four-state Hidden Markov Models with Baum-Welch parameter estimation 
                for real-time market state identification and probabilistic forecasting 
                across momentum and mean-reversion regimes.
              </p>
            </div>
          </div>

          {/* Proprietary Quantitative Framework */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-8 text-center">
              Proprietary Quantitative Framework
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-serif text-xl font-bold text-navy-900 mb-4">
                  Statistical Arbitrage Models
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Ornstein-Uhlenbeck Process</div>
                      <div className="text-sm text-gray-600">Mean reversion modeling with stochastic differential equations</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Johansen Cointegration</div>
                      <div className="text-sm text-gray-600">Statistical pairs identification through vector error correction</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Dynamic Hedge Ratios</div>
                      <div className="text-sm text-gray-600">Principal component analysis for multi-factor risk exposure</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Fair Value Estimation</div>
                      <div className="text-sm text-gray-600">Mean reversion strategies around theoretical price levels</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-serif text-xl font-bold text-navy-900 mb-4">
                  Market Maker Inventory Risk
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Glosten-Milgrom Sequential Models</div>
                      <div className="text-sm text-gray-600">Adverse selection prevention through informed trading detection</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Amihud-Mendelson Decomposition</div>
                      <div className="text-sm text-gray-600">Bid-ask spread analysis for liquidity cost optimization</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Ho-Stoll Dealer Framework</div>
                      <div className="text-sm text-gray-600">Market maker positioning and inventory risk management</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-medium text-navy-900">Queue Position Optimization</div>
                      <div className="text-sm text-gray-600">Advanced algorithms for optimal order placement and execution</div>
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