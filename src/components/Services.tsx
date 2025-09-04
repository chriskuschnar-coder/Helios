import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp, Eye, Server, Activity } from 'lucide-react'

export function Services() {
  const capabilities = [
    {
      icon: Eye,
      title: 'Market Surveillance',
      description: 'Real-time monitoring of global liquidity across all major venues',
      metrics: ['250K+ events/second', '99.97% uptime', '2.4TB daily data']
    },
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'AI-powered analysis that identifies profitable opportunities instantly',
      metrics: ['14 parallel systems', 'Hourly evolution', 'Multi-layer validation']
    },
    {
      icon: Zap,
      title: 'Execution Engine',
      description: 'Institutional-grade trading infrastructure with millisecond precision',
      metrics: ['Trillion-dollar algorithms', 'Hidden order routing', 'Automatic profit locks']
    },
    {
      icon: Target,
      title: 'Learning System',
      description: 'Self-improving algorithms that get smarter with every trade',
      metrics: ['Daily optimization', 'Pattern library growth', 'Neural adaptation']
    }
  ]

  return (
    <>
      {/* Main Systems Section */}
      <section id="services" className="relative bg-black text-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="https://videos.pexels.com/video-files/5028622/5028622-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/5028622/5028622-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-8">
              The Four Pillars of HELIOS
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Each system represents decades of institutional knowledge, 
              compressed into algorithms that work for you 24/7.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {capabilities.map((capability, index) => (
              <div key={index} className="group">
                <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gold-400 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gold-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                      <capability.icon className="h-8 w-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-1">
                        {capability.title}
                      </h3>
                      <h4 className="text-2xl font-bold text-white">
                        {capability.description}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {capability.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="bg-black bg-opacity-50 rounded-xl p-4 border border-gray-800">
                        <div className="text-gold-400 font-bold text-lg">{metric}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unfair Advantages Section */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-8">
              WHY US: The Unfair Advantages
            </h2>
            <div className="space-y-4">
              <p className="text-2xl text-gray-300 font-bold">
                We're Not Selling You Software.
              </p>
              <p className="text-2xl text-gold-400 font-bold">
                We're Selling You a Seat at the Institutional Table.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: 'Speed Advantage',
                description: 'Millisecond execution vs. human minutes',
                icon: Zap,
                color: 'from-yellow-500 to-orange-500'
              },
              {
                title: 'Scale Advantage', 
                description: 'Monitor everything, miss nothing',
                icon: Activity,
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Intelligence Advantage',
                description: '14 PhDs worth of analysis, instantly',
                icon: Brain,
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Discipline Advantage',
                description: 'Zero emotion, pure mathematics',
                icon: Shield,
                color: 'from-green-500 to-emerald-500'
              },
              {
                title: 'Time Advantage',
                description: 'Makes money while you sleep, vacation, live',
                icon: TrendingUp,
                color: 'from-red-500 to-pink-500'
              }
            ].map((advantage, index) => (
              <div key={index} className="group">
                <div className="bg-black rounded-2xl p-8 border border-gray-700 hover:border-gold-400 transition-all duration-300 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${advantage.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The Vision */}
          <div className="text-center">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-8">
              THE VISION: Your Financial Empire
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              This isn't about trading anymore. It's about owning the infrastructure that controls the game.
            </p>
            
            <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 rounded-3xl p-16 mb-16">
              <h3 className="font-serif text-6xl lg:text-7xl font-bold text-black mb-12">
                Welcome to HELIOS
              </h3>
              <div className="space-y-6 text-black text-2xl lg:text-3xl font-bold">
                <p>Where code becomes capital.</p>
                <p>Where algorithms build empires.</p>
                <p>Where your future runs on autopilot.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-gold-400 mb-4">$100M</div>
                <div className="text-white font-medium mb-2">Technology Value</div>
                <div className="text-gray-400 text-sm">Built for institutional scale</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-gold-400 mb-4">24/7</div>
                <div className="text-white font-medium mb-2">Autonomous Operation</div>
                <div className="text-gray-400 text-sm">Never stops working</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="text-4xl font-bold text-gold-400 mb-4">∞</div>
                <div className="text-white font-medium mb-2">Scalability</div>
                <div className="text-gray-400 text-sm">Grows with your capital</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}