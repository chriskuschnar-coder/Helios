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
      <section id="services" className="py-20 bg-white">
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
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 group hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-all duration-200">
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
                      <div className="w-1.5 h-1.5 bg-navy-600 rounded-full mr-2"></div>
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
      <section className="relative py-20 bg-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
            onError={(e) => console.error('Video error:', e)}
          >
            <source src="https://videos.pexels.com/video-files/7685826/7685826-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/7685826/7685826-hd_1920_1080_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/7685826/7685826-sd_960_540_25fps.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-navy-900 bg-opacity-85"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Advanced Market Microstructure Analytics
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Our proprietary quantitative models implement cutting-edge academic research 
              for systematic alpha generation and superior risk management through mathematical precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                VPIN Analysis
              </h3>
              <p className="text-gray-200">
                Volume-Synchronized Probability of Informed Trading with machine learning 
                enhancement calibrated on 119,000+ trade samples for toxic flow identification 
                and adverse selection prevention.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Kyle's Lambda
              </h3>
              <p className="text-gray-200">
                Dynamic price impact modeling with Hasbrouck decomposition for 
                optimal execution algorithms, achieving 52% slippage reduction 
                versus time-weighted average price benchmarks.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Regime Detection
              </h3>
              <p className="text-gray-200">
                Four-state Hidden Markov Models with Baum-Welch parameter estimation 
                for real-time market state identification and probabilistic forecasting 
                across momentum and mean-reversion regimes.
              </p>
            </div>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white border-opacity-30">
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
                    Professional Execution Strategies
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <div className="font-medium text-navy-900">Smart Order Timing</div>
                        <div className="text-sm text-gray-600">Avoiding trades when large players might move against us, protecting your returns</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <div className="font-medium text-navy-900">Cost-Efficient Trading</div>
                        <div className="text-sm text-gray-600">Minimizing trading costs through intelligent order placement and timing strategies</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <div className="font-medium text-navy-900">Market Maker Positioning</div>
                        <div className="text-sm text-gray-600">Tracking how market makers position themselves to anticipate price movements</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gold-600 rounded-full mt-2 mr-3"></div>
                      <div>
                        <div className="font-medium text-navy-900">Optimal Order Placement</div>
                        <div className="text-sm text-gray-600">Advanced algorithms for optimal trade execution and market impact minimization</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm">
                  <div className="font-serif text-3xl font-bold text-navy-900 mb-2">50K+</div>
                  <div className="text-gray-600">Events/Second</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm">
                  <div className="font-serif text-3xl font-bold text-gold-400 mb-2">99.97%</div>
                  <div className="text-gray-600">System Uptime</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm">
                  <div className="font-serif text-3xl font-bold text-navy-900 mb-2">2.4TB</div>
                  <div className="text-gray-600">Daily Data</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm">
                  <div className="font-serif text-3xl font-bold text-gold-400 mb-2">500+</div>
                  <div className="text-gray-600">Real-time Factors</div>
                </div>
              </div>
            </div>
        </div>
      </section>
    </>
  )
}