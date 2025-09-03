import { Award, Globe, Users, Target, Brain, Zap, Shield, BarChart3 } from 'lucide-react'

export function About() {
  const features = [
    {
      icon: Brain,
      title: 'Quantitative Architecture',
      description: '$2.8M investment in proprietary quantitative research and infrastructure development.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Zap,
      title: 'Market Microstructure',
      description: 'Processing 50,000+ tick-level events per second across primary liquidity venues.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced VaR modeling with Monte Carlo simulation and real-time stress testing.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Proven Performance',
      description: 'Consistent profitability across 4 institutional accounts with 287% average growth.',
      color: 'from-gold-500 to-orange-600'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-navy-100 rounded-full mb-6">
            <span className="text-navy-700 text-sm font-semibold">ABOUT OUR TECHNOLOGY</span>
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
            Revolutionary Quantitative Investment Management
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Our quantitative system represents the intersection of academic finance theory 
            and practical market application, utilizing advanced mathematical models to 
            anticipate market dynamics through statistical inference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-glow`}>
                <feature.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-navy-900 via-slate-800 to-navy-900 rounded-3xl p-8 lg:p-12 shadow-2xl border border-slate-700/50">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-display text-2xl lg:text-4xl font-bold text-white mb-8">
                Advanced Quantitative Models
              </h3>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                <p>
                  <strong className="text-emerald-400">VPIN Implementation:</strong> Proprietary Volume-Synchronized Probability 
                  of Informed Trading framework with machine learning enhancement calibrated on 
                  119,000+ trade samples.
                </p>
                <p>
                  <strong className="text-blue-400">Hidden Markov Models:</strong> Four-state regime detection with Gaussian 
                  emissions for real-time market state identification and probabilistic forecasting.
                </p>
                <p>
                  <strong className="text-gold-400">Statistical Arbitrage:</strong> Ornstein-Uhlenbeck process calibration 
                  with cointegration testing via Johansen methodology for pairs trading strategies.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="font-display text-3xl font-bold text-emerald-400 mb-2">50K+</div>
                <div className="text-slate-300 font-medium">Events/Second</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="font-display text-3xl font-bold text-gold-400 mb-2">99.97%</div>
                <div className="text-slate-300 font-medium">System Uptime</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="font-display text-3xl font-bold text-blue-400 mb-2">2.4TB</div>
                <div className="text-slate-300 font-medium">Daily Data</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="font-display text-3xl font-bold text-purple-400 mb-2">500+</div>
                <div className="text-slate-300 font-medium">Real-time Factors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}