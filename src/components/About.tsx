import { Eye, Brain, Zap, Target, ArrowRight } from 'lucide-react'

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
      translation: 'We have eyes everywhere, all the time.'
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
      translation: 'We think faster than any human ever could.'
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
      translation: 'We trade like the professionals, not the public.'
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
      translation: 'Tomorrow\'s version is smarter than today\'s.'
    }
  ]

  const advantages = [
    {
      title: 'Speed Advantage',
      description: 'Millisecond execution vs. human minutes'
    },
    {
      title: 'Scale Advantage', 
      description: 'Monitor everything, miss nothing'
    },
    {
      title: 'Intelligence Advantage',
      description: '14 PhDs worth of analysis, instantly'
    },
    {
      title: 'Discipline Advantage',
      description: 'Zero emotion, pure mathematics'
    },
    {
      title: 'Time Advantage',
      description: 'Makes money while you sleep, vacation, live'
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-black mb-6">
            WHAT WE'VE BUILT
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 font-medium mb-4">
            The Technology That Changes Everything
          </p>
        </div>

        {/* Compact Four Core Systems */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {systems.map((system, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-black transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <system.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {system.title}
                  </h3>
                  <h4 className="text-lg font-bold text-black">
                    {system.subtitle}
                  </h4>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {system.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-black font-medium italic">
                  Translation: {system.translation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Unfair Advantages Section */}
        <div className="bg-black rounded-3xl p-12 mb-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-8">
              WHY US: The Unfair Advantages
            </h2>
            <div className="space-y-4">
              <p className="text-2xl text-white font-bold">
                We're Not Selling You Software.
              </p>
              <p className="text-2xl text-gray-300 font-bold">
                We're Selling You a Seat at the Institutional Table.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="group">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-white transition-all duration-300 h-full">
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
        </div>

        {/* The Vision Section */}
        <div className="text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-black mb-8">
            THE VISION: Your Financial Empire
          </h2>
          <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            This isn't about trading anymore. It's about owning the infrastructure that controls the game.
          </p>
          
          <div className="bg-black rounded-3xl p-12 mb-12">
            <h3 className="font-serif text-5xl lg:text-6xl font-bold text-white mb-8">
              Welcome to HELIOS
            </h3>
            <div className="space-y-4 text-white text-xl lg:text-2xl font-medium">
              <p>Where code becomes capital.</p>
              <p>Where algorithms build empires.</p>
              <p>Where your future runs on autopilot.</p>
            </div>
          </div>

          <button className="bg-black hover:bg-gray-800 text-white px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 hover:scale-105 shadow-2xl">
            Enter HELIOS
            <ArrowRight className="h-6 w-6 ml-3 inline" />
          </button>
        </div>
      </div>
    </section>
  )
}