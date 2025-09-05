import { Award, Globe, Users, Target, Brain, Zap, Shield, BarChart3 } from 'lucide-react'

export function About() {
  const features = [
    {
      icon: Brain,
      title: 'Real-time Helios Tracking',
      description: 'Live portfolio monitoring with instant updates as market conditions change.'
    },
    {
      icon: Zap,
      title: 'Automated Fund Allocation',
      description: 'Your investments are automatically converted into fund units based on current NAV.'
    },
    {
      icon: Shield,
      title: 'Secure Infrastructure',
      description: 'Built on Supabase with bank-level security and full regulatory compliance.'
    },
    {
      icon: BarChart3,
      title: 'Transparent Reporting',
      description: 'Clear, detailed reporting so you always know exactly where you stand.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Who We Are
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Global Market Consulting is a modern investment firm focused on giving investors 
            of all sizes access to institutional-grade strategies. We combine technology and 
            expertise to make investing simple, transparent, and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mb-4 group-hover:bg-navy-200 transition-all duration-200">
                <feature.icon className="h-8 w-8 text-navy-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-6">
                Simple, Transparent, Connected
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Sign Up</h4>
                    <p className="text-gray-700">Create your investor account quickly and securely.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Fund Your Portfolio</h4>
                    <p className="text-gray-700">Deposit funds and watch them automatically converted into fund units based on the latest NAV.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Monitor & Grow</h4>
                    <p className="text-gray-700">Track your investments in real time. View your portfolio, equity, and daily performance effortlessly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">Live</div>
                <div className="text-navy-700">Portfolio Updates</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">Auto</div>
                <div className="text-navy-700">Fund Allocation</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">24/7</div>
                <div className="text-navy-700">Monitoring</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">100%</div>
                <div className="text-navy-700">Transparent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}