import { Eye, Brain, Zap, Shield, Server, Target, Activity, TrendingUp } from 'lucide-react'

export function About() {
  const systems = [
    {
      icon: Eye,
      title: 'THE INFRASTRUCTURE',
      subtitle: 'Global Market Dominance System',
      features: [
        'Connected to every major liquidity source simultaneously',
        'Processing quarter-million market events per second', 
        'Seeing market depth that retail platforms hide',
        'Military-grade redundancy across multiple data centers'
      ],
      translation: 'We have eyes everywhere, all the time.',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Brain,
      title: 'THE INTELLIGENCE',
      subtitle: 'Proprietary Pattern Recognition Engine',
      features: [
        '14 parallel processing systems working in concert',
        'Institutional-grade market microstructure analysis',
        'Adaptive algorithms that evolve every hour',
        'Multi-layer validation preventing false signals'
      ],
      translation: 'We think faster than any human ever could.',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Zap,
      title: 'THE EXECUTION',
      subtitle: 'Hedge Fund Trading Desk in a Box',
      features: [
        'Position sizing algorithms used by trillion-dollar funds',
        'Advanced order routing that hides our intentions',
        'Risk management rules from the world\'s top performers',
        'Profit protection systems that lock in gains automatically'
      ],
      translation: 'We trade like the professionals, not the public.',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: Target,
      title: 'THE LEARNING SYSTEM',
      subtitle: 'Self-Optimizing Performance Engine',
      features: [
        'Every decision tracked, measured, and improved',
        'Pattern library that grows stronger daily',
        'Threshold optimization that adapts to market conditions',
        'Neural pathways that remember what works'
      ],
      translation: 'Tomorrow\'s version is smarter than today\'s.',
      color: 'from-green-600 to-emerald-600'
    }
  ]

  const advantages = [
    {
      title: 'Speed Advantage',
      description: 'Millisecond execution vs. human minutes',
      icon: Zap
    },
    {
      title: 'Scale Advantage', 
      description: 'Monitor everything, miss nothing',
      icon: Activity
    },
    {
      title: 'Intelligence Advantage',
      description: '14 PhDs worth of analysis, instantly',
      icon: Brain
    },
    {
      title: 'Discipline Advantage',
      description: 'Zero emotion, pure mathematics',
      icon: Shield
    },
    {
      title: 'Time Advantage',
      description: 'Makes money while you sleep, vacation, live',
      icon: TrendingUp
    }
  ]

  return (
    <section id="about" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
            WHAT WE'VE BUILT
          </h2>
          <p className="text-2xl lg:text-3xl text-gold-400 font-bold mb-4">
            The Black Box That Prints Money
          </p>
        </div>

        {/* Four Core Systems */}
        <div className="space-y-20 mb-32">
          {systems.map((system, index) => (
            <div key={index} className="relative">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${system.color} rounded-2xl flex items-center justify-center`}>
                      <system.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {system.title}
                      </h3>
                      <h4 className="text-2xl lg:text-3xl font-bold text-white">
                        {system.subtitle}
                      </h4>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {system.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gold-400 rounded-full mt-3 flex-shrink-0"></div>
                        <span className="text-gray-300 text-lg leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <p className="text-gold-400 font-bold text-xl italic">
                      Translation: {system.translation}
                    </p>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className={`bg-gradient-to-r ${system.color} rounded-3xl p-8 text-center`}>
                    <system.icon className="h-24 w-24 text-white mx-auto mb-6" />
                    <div className="text-6xl font-bold text-white mb-4">
                      {index === 0 ? '250K' : index === 1 ? '14' : index === 2 ? '∞' : 'AI'}
                    </div>
                    <div className="text-white font-medium text-lg">
                      {index === 0 ? 'Events/Second' : index === 1 ? 'AI Systems' : index === 2 ? 'Execution Speed' : 'Learning'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unfair Advantages Section */}
        <div className="bg-gray-900 rounded-3xl p-12 border border-gray-800 mb-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
              WHY US: The Unfair Advantages
            </h2>
            <p className="text-2xl text-gold-400 font-bold mb-4">
              We're Not Selling You Software.
            </p>
            <p className="text-2xl text-white font-bold">
              We're Selling You a Seat at the Institutional Table.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-black rounded-2xl p-8 border border-gray-700 hover:border-gold-400 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gold-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {advantage.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The Vision Section */}
        <div className="text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-8">
            THE VISION: Your Financial Empire
          </h2>
          <p className="text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            This isn't about trading anymore. It's about owning the infrastructure that controls the game.
          </p>
          
          <div className="bg-gradient-to-r from-gold-600 to-gold-400 rounded-3xl p-12 mb-12">
            <h3 className="font-serif text-5xl lg:text-6xl font-bold text-black mb-8">
              Welcome to HELIOS
            </h3>
            <div className="space-y-4 text-black text-xl lg:text-2xl font-medium">
              <p>Where code becomes capital.</p>
              <p>Where algorithms build empires.</p>
              <p>Where your future runs on autopilot.</p>
            </div>
          </div>

          <button className="bg-white hover:bg-gray-100 text-black px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 hover:scale-105 shadow-2xl">
            Enter HELIOS
            <ArrowRight className="h-6 w-6 ml-3 inline" />
          </button>
        </div>
      </div>
    </section>
  )
}