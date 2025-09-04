import { ArrowRight, Play, TrendingUp, Zap, Target, Brain } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/8201410/8201410-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/8201410/8201410-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Opening Hook */}
          <div className="mb-8">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-4 leading-relaxed">
              Every day, <span className="text-gold-400 font-bold">$7.5 trillion</span> moves through global markets.
            </p>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 leading-relaxed">
              The firms capturing this value aren't smarter than you - 
              <br className="hidden md:block" />
              <span className="text-white font-semibold">they just have better machines.</span>
            </p>
            <p className="text-lg md:text-xl lg:text-2xl text-gold-400 font-bold leading-relaxed">
              Until now, that technology cost $100 million to build.
            </p>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight">
            We built it for you.
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="bg-gold-600 hover:bg-gold-700 text-navy-900 px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 flex items-center space-x-3 hover:scale-105 shadow-2xl">
              <Zap className="h-6 w-6" />
              <span>Client Portal</span>
              <ArrowRight className="h-6 w-6" />
            </button>
            
            <button className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 flex items-center space-x-3">
              <Play className="h-6 w-6" />
              <span>See The Machine</span>
            </button>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <p className="text-2xl md:text-3xl text-white font-light mb-2">
              Welcome to <span className="font-bold text-gold-400">Nautilus</span>
            </p>
            <div className="text-lg md:text-xl text-gray-300 space-y-1">
              <p>Where code becomes capital.</p>
              <p>Where algorithms build empires.</p>
              <p className="text-gold-400 font-semibold">Where your future runs on autopilot.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Performance() {
  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
            The Black Box That Prints Money
          </h2>
          <p className="text-xl text-navy-200 max-w-4xl mx-auto leading-relaxed">
            We're not selling you software. We're selling you a seat at the institutional table.
          </p>
        </div>

        {/* The Infrastructure */}
        <div className="bg-white rounded-3xl p-12 mb-16 border border-gray-200 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-navy-900 mb-4">
              THE INFRASTRUCTURE
            </h3>
            <h4 className="text-2xl font-bold text-gold-600 mb-6">
              Global Market Dominance System
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Connected to every major liquidity source simultaneously</h5>
                  <p className="text-gray-700">Direct feeds from NYSE, NASDAQ, CME, ICE, and 47 dark pools</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Processing quarter-million market events per second</h5>
                  <p className="text-gray-700">Real-time tick data, order book depth, and institutional flow</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Seeing market depth that retail platforms hide</h5>
                  <p className="text-gray-700">Level 3 data, hidden liquidity, and institutional intentions</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Military-grade redundancy across multiple data centers</h5>
                  <p className="text-gray-700">99.97% uptime with failover systems in 4 continents</p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-50 rounded-2xl p-8 text-center">
              <h6 className="text-lg font-bold text-navy-900 mb-6">Translation:</h6>
              <p className="text-2xl font-bold text-navy-900 leading-tight">
                We have eyes everywhere, all the time.
              </p>
            </div>
          </div>
        </div>

        {/* The Intelligence */}
        <div className="bg-white rounded-3xl p-12 mb-16 border border-gray-200 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-navy-900 mb-4">
              THE INTELLIGENCE
            </h3>
            <h4 className="text-2xl font-bold text-gold-600 mb-6">
              Proprietary Pattern Recognition Engine
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">14 parallel processing systems working in concert</h5>
                  <p className="text-gray-700">Momentum, mean reversion, volatility, and correlation engines</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Institutional-grade market microstructure analysis</h5>
                  <p className="text-gray-700">VPIN, Kyle's Lambda, and Hasbrouck decomposition</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Adaptive algorithms that evolve every hour</h5>
                  <p className="text-gray-700">Machine learning models that improve with every trade</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Multi-layer validation preventing false signals</h5>
                  <p className="text-gray-700">Cross-validation across timeframes and asset classes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-50 rounded-2xl p-8 text-center">
              <h6 className="text-lg font-bold text-navy-900 mb-6">Translation:</h6>
              <p className="text-2xl font-bold text-navy-900 leading-tight">
                We think faster than any human ever could.
              </p>
            </div>
          </div>
        </div>

        {/* The Execution */}
        <div className="bg-white rounded-3xl p-12 mb-16 border border-gray-200 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-navy-900 mb-4">
              THE EXECUTION
            </h3>
            <h4 className="text-2xl font-bold text-gold-600 mb-6">
              Hedge Fund Trading Desk in a Box
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Position sizing algorithms used by trillion-dollar funds</h5>
                  <p className="text-gray-700">Kelly criterion optimization with volatility targeting</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Advanced order routing that hides our intentions</h5>
                  <p className="text-gray-700">Smart order fragmentation and timing algorithms</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Risk management rules from the world's top performers</h5>
                  <p className="text-gray-700">Dynamic stop losses and correlation-based hedging</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Profit protection systems that lock in gains automatically</h5>
                  <p className="text-gray-700">Trailing stops and momentum-based exit strategies</p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-50 rounded-2xl p-8 text-center">
              <h6 className="text-lg font-bold text-navy-900 mb-6">Translation:</h6>
              <p className="text-2xl font-bold text-navy-900 leading-tight">
                We trade like the professionals, not the public.
              </p>
            </div>
          </div>
        </div>

        {/* The Learning System */}
        <div className="bg-white rounded-3xl p-12 mb-16 border border-gray-200 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-navy-900 mb-4">
              THE LEARNING SYSTEM
            </h3>
            <h4 className="text-2xl font-bold text-gold-600 mb-6">
              Self-Optimizing Performance Engine
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Every decision tracked, measured, and improved</h5>
                  <p className="text-gray-700">Complete audit trail with performance attribution</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Pattern library that grows stronger daily</h5>
                  <p className="text-gray-700">Expanding database of market behaviors and responses</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Threshold optimization that adapts to market conditions</h5>
                  <p className="text-gray-700">Dynamic parameter adjustment based on regime detection</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-gold-600 rounded-full mt-2"></div>
                <div>
                  <h5 className="font-bold text-navy-900 mb-2">Neural pathways that remember what works</h5>
                  <p className="text-gray-700">Reinforcement learning from successful strategies</p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy-50 rounded-2xl p-8 text-center">
              <h6 className="text-lg font-bold text-navy-900 mb-6">Translation:</h6>
              <p className="text-2xl font-bold text-navy-900 leading-tight">
                Tomorrow's version is smarter than today's.
              </p>
            </div>
          </div>
        </div>

        {/* Unfair Advantages */}
        <div className="bg-gradient-to-r from-navy-900 to-black rounded-3xl p-12 border border-gold-600 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-white mb-4">
              WHY US: The Unfair Advantages
            </h3>
            <p className="text-xl text-gold-400 font-semibold">
              We're Not Selling You Software. We're Selling You a Seat at the Institutional Table.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-navy-900" />
              </div>
              <h4 className="font-bold text-white mb-2">Speed Advantage</h4>
              <p className="text-navy-200 text-sm">Millisecond execution vs. human minutes</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-navy-900" />
              </div>
              <h4 className="font-bold text-white mb-2">Scale Advantage</h4>
              <p className="text-navy-200 text-sm">Monitor everything, miss nothing</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-navy-900" />
              </div>
              <h4 className="font-bold text-white mb-2">Intelligence Advantage</h4>
              <p className="text-navy-200 text-sm">14 PhDs worth of analysis, instantly</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-navy-900" />
              </div>
              <h4 className="font-bold text-white mb-2">Discipline Advantage</h4>
              <p className="text-navy-200 text-sm">Zero emotion, pure mathematics</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Play className="h-8 w-8 text-navy-900" />
              </div>
              <h4 className="font-bold text-white mb-2">Time Advantage</h4>
              <p className="text-navy-200 text-sm">Makes money while you sleep, vacation, live</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}