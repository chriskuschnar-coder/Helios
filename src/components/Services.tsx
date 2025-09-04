import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp } from 'lucide-react'

export function Services() {
  return (
    <>
      {/* Investment Products Section */}
      <section id="services" className="relative bg-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const errorCode = e.currentTarget.error?.code
              console.error('Video loading failed:', errorCode ? `Error code: ${errorCode}` : 'Unknown error')
            }}
          >
            <source src="https://videos.pexels.com/video-files/5028622/5028622-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/5028622/5028622-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="relative z-10 font-serif text-3xl lg:text-4xl font-bold text-white mb-4">
              Quantitative Investment Products
            </h2>
            <p className="relative z-10 text-xl text-gray-200 max-w-3xl mx-auto">
              Sophisticated mathematical models designed for institutional investors 
              and qualified individuals seeking superior risk-adjusted returns through 
              systematic market inefficiency exploitation.
            </p>
          </div>

        </div>
      </section>

      {/* Advanced Market Microstructure Analytics Section */}
      <section className="py-20 bg-white">
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

          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
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
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
  )
}