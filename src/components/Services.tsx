import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp, Activity, Globe, Cpu, Database } from 'lucide-react'

export function Services() {
  const advantages = [
    {
      icon: Zap,
      title: 'Speed Advantage',
      description: 'Millisecond execution vs. human minutes',
      details: 'Sub-millisecond order routing with co-located servers at major exchanges'
    },
    {
      icon: Globe,
      title: 'Scale Advantage', 
      description: 'Monitor everything, miss nothing',
      details: 'Simultaneous analysis across 50+ markets and 10,000+ instruments'
    },
    {
      icon: Brain,
      title: 'Intelligence Advantage',
      description: '14 PhDs worth of analysis, instantly',
      details: 'Machine learning models processing patterns humans cannot perceive'
    },
    {
      icon: Target,
      title: 'Discipline Advantage',
      description: 'Zero emotion, pure mathematics',
      details: 'Systematic execution without fear, greed, or cognitive bias'
    },
    {
      icon: Activity,
      title: 'Time Advantage',
      description: 'Makes money while you sleep, vacation, live',
      details: '24/7 global market coverage across all time zones'
    }
  ]

  const systems = [
    {
      icon: Database,
      title: 'Market Data Infrastructure',
      description: 'Real-time feeds from every major exchange',
      specs: ['250K events/second', '47 dark pools', 'Level 3 data', '99.97% uptime']
    },
    {
      icon: Cpu,
      title: 'Processing Engine',
      description: '14 parallel AI systems working in concert',
      specs: ['Pattern recognition', 'Regime detection', 'Risk modeling', 'Execution optimization']
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Institutional-grade protection systems',
      specs: ['Dynamic hedging', 'Correlation monitoring', 'Stress testing', 'Capital preservation']
    },
    {
      icon: TrendingUp,
      title: 'Performance Engine',
      description: 'Self-optimizing trading algorithms',
      specs: ['Adaptive learning', 'Strategy evolution', 'Profit maximization', 'Loss minimization']
    }
  ]

  return (
    <>
      {/* Main Systems Section */}
      <section id="services" className="relative bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-black to-navy-800"></div>
          <div className="absolute inset-0 opacity-20">
            {/* Animated grid pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
              The Machine Behind The Magic
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Four interconnected systems that give you the same technological advantages 
              as the world's most successful hedge funds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {systems.map((system, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-300 group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <system.icon className="h-8 w-8 text-navy-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{system.title}</h3>
                    <p className="text-gray-300">{system.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {system.specs.map((spec, specIndex) => (
                    <div key={specIndex} className="bg-black bg-opacity-30 rounded-lg p-3 text-center">
                      <div className="text-gold-400 font-semibold text-sm">{spec}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Unfair Advantages Grid */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 border border-white border-opacity-20">
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl font-bold text-white mb-4">
                Your Unfair Advantages
              </h3>
              <p className="text-xl text-gold-400 font-semibold">
                What separates you from everyone else still using retail platforms
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {advantages.map((advantage, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <advantage.icon className="h-10 w-10 text-navy-900" />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-lg">{advantage.title}</h4>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{advantage.description}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{advantage.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>
      </section>

      {/* Technology Deep Dive */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
              The Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on the same mathematical foundations as the world's most successful quantitative funds
            </p>
          </div>

          <div className="bg-navy-900 rounded-3xl p-12 lg:p-16 text-white">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="font-serif text-3xl font-bold mb-8">
                  Advanced Mathematical Models
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gold-400 mb-3">VPIN Implementation</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Volume-Synchronized Probability of Informed Trading framework with machine learning 
                      enhancement calibrated on 119,000+ trade samples. Detects when large institutions 
                      are moving markets before price impact occurs.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gold-400 mb-3">Hidden Markov Models</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Four-state regime detection with Gaussian emissions for real-time market state 
                      identification. Automatically switches between momentum and mean-reversion strategies 
                      based on market conditions.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gold-400 mb-3">Statistical Arbitrage</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Ornstein-Uhlenbeck process calibration with cointegration testing via Johansen 
                      methodology. Identifies and exploits temporary price dislocations across 
                      correlated instruments.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gold-600 rounded-xl p-6 text-center text-navy-900">
                  <div className="font-serif text-4xl font-bold mb-2">250K+</div>
                  <div className="font-semibold">Events/Second</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="font-serif text-4xl font-bold text-navy-900 mb-2">99.97%</div>
                  <div className="text-navy-700 font-semibold">System Uptime</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="font-serif text-4xl font-bold text-navy-900 mb-2">2.4TB</div>
                  <div className="text-navy-700 font-semibold">Daily Data</div>
                </div>
                <div className="bg-gold-600 rounded-xl p-6 text-center text-navy-900">
                  <div className="font-serif text-4xl font-bold mb-2">14</div>
                  <div className="font-semibold">AI Systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}