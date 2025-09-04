import { Award, Globe, Users, Target, Brain, Zap, Shield, BarChart3, TrendingUp, Activity } from 'lucide-react'

export function About() {
  const metrics = [
    {
      icon: Zap,
      title: '250,000',
      subtitle: 'Events/Second',
      description: 'Real-time market data processing across all major exchanges and dark pools.'
    },
    {
      icon: Brain,
      title: '14',
      subtitle: 'AI Systems',
      description: 'Parallel processing engines analyzing patterns, momentum, and market structure.'
    },
    {
      icon: Shield,
      title: '99.97%',
      subtitle: 'System Uptime',
      description: 'Military-grade redundancy with failover systems across 4 continents.'
    },
    {
      icon: BarChart3,
      title: '$2.4TB',
      subtitle: 'Daily Data',
      description: 'Institutional-grade market intelligence processed every trading day.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
            What We've Built
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            This isn't about trading anymore. It's about owning the infrastructure that controls the game.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-navy-100 rounded-full mb-6 group-hover:bg-navy-200 transition-all duration-200">
                <metric.icon className="h-10 w-10 text-navy-600" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-navy-900 mb-2">
                {metric.title}
              </h3>
              <h4 className="text-lg font-bold text-gold-600 mb-4">
                {metric.subtitle}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* The Vision Section */}
        <div className="bg-gradient-to-r from-navy-900 via-black to-navy-900 rounded-3xl p-12 lg:p-16 border border-gold-600 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
              THE VISION
            </h3>
            <h4 className="text-3xl font-bold text-gold-400 mb-8">
              Your Financial Empire
            </h4>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              This isn't about trading anymore. It's about owning the infrastructure that controls the game.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-navy-900" />
              </div>
              <h5 className="text-xl font-bold text-white mb-4">Institutional Intelligence</h5>
              <p className="text-gray-300 leading-relaxed">
                Access the same quantitative models and market intelligence that power the world's largest hedge funds.
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-navy-900" />
              </div>
              <h5 className="text-xl font-bold text-white mb-4">24/7 Execution</h5>
              <p className="text-gray-300 leading-relaxed">
                Your capital works around the clock, capturing opportunities across global markets while you focus on life.
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-navy-900" />
              </div>
              <h5 className="text-xl font-bold text-white mb-4">Compound Growth</h5>
              <p className="text-gray-300 leading-relaxed">
                Mathematical precision in capital allocation creates exponential wealth accumulation over time.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gold-600 rounded-2xl p-8">
              <h6 className="text-2xl font-bold text-navy-900 mb-4">
                Welcome to Nautilus
              </h6>
              <div className="space-y-2 text-navy-900 font-semibold text-lg">
                <p>Where code becomes capital.</p>
                <p>Where algorithms build empires.</p>
                <p>Where your future runs on autopilot.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-navy-900 mb-4">
              The Numbers Don't Lie
            </h3>
            <p className="text-xl text-gray-600">
              Real performance from real capital in real markets
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-green-600 mb-2">342%</div>
              <div className="text-gray-600 font-medium">Annual Returns</div>
              <div className="text-sm text-gray-500 mt-1">2024 Performance</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-navy-900 mb-2">2.94</div>
              <div className="text-gray-600 font-medium">Sharpe Ratio</div>
              <div className="text-sm text-gray-500 mt-1">Risk-Adjusted</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-gold-600 mb-2">5.7%</div>
              <div className="text-gray-600 font-medium">Max Drawdown</div>
              <div className="text-sm text-gray-500 mt-1">Capital Protection</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-green-600 mb-2">Zero</div>
              <div className="text-gray-600 font-medium">Account Failures</div>
              <div className="text-sm text-gray-500 mt-1">100% Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}