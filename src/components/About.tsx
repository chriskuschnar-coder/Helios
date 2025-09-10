import { Award, Globe, Users, Target, Brain, Zap, Shield, BarChart3 } from 'lucide-react'

export function About() {
  const capabilities = [
    {
      icon: Brain,
      title: 'Quantitative Research',
      description: 'Proprietary models and systematic approaches to identify market inefficiencies and alpha opportunities.'
    },
    {
      icon: Globe,
      title: 'Global Market Expertise',
      description: 'Deep understanding of interconnected global markets, from developed economies to emerging opportunities.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Sophisticated risk frameworks designed to preserve capital while pursuing asymmetric return opportunities.'
    },
    {
      icon: BarChart3,
      title: 'Institutional Infrastructure',
      description: 'Professional-grade systems, compliance, and operational excellence meeting institutional standards.'
    }
  ]

  const teamMembers = [
    {
      name: 'Dr. Sarah Chen, CFA',
      title: 'Chief Investment Officer',
      background: 'Former Goldman Sachs Managing Director with 15+ years in systematic trading. PhD in Financial Mathematics from Stanford.',
      expertise: 'Quantitative strategies, derivatives, risk management'
    },
    {
      name: 'Michael Rodriguez, PhD',
      title: 'Head of Research',
      background: 'Ex-Two Sigma Principal with expertise in machine learning applications to finance. MIT PhD in Econometrics.',
      expertise: 'Statistical modeling, market microstructure, algorithmic trading'
    },
    {
      name: 'James Liu, CFA',
      title: 'Portfolio Manager',
      background: 'Former Bridgewater Associate with deep macro experience. Wharton MBA, CFA charterholder.',
      expertise: 'Global macro, currency markets, portfolio construction'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            About Global Markets Consulting
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Founded by seasoned professionals from leading investment institutions, Global Markets Consulting 
            combines decades of experience with cutting-edge analytical frameworks to navigate today's 
            complex investment landscape. We serve sophisticated investors through research-driven strategies 
            and systematic approaches designed for long-term wealth preservation and growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {capabilities.map((capability, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mb-4 group-hover:bg-navy-200 transition-all duration-200">
                <capability.icon className="h-8 w-8 text-navy-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                {capability.title}
              </h3>
              <p className="text-gray-600">
                {capability.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg mb-16">
          <div className="text-center mb-12">
            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
              Leadership Team
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our team brings together expertise from premier investment institutions, 
              combining academic rigor with practical market experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-navy-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.name.split(' ')[0].charAt(0)}{member.name.split(' ')[1].charAt(0)}
                </div>
                <h4 className="font-serif text-xl font-bold text-navy-900 mb-2">
                  {member.name}
                </h4>
                <p className="text-gold-600 font-semibold mb-3">
                  {member.title}
                </p>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {member.background}
                </p>
                <p className="text-navy-600 text-xs font-medium">
                  {member.expertise}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Firm Overview */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-6">
                Our Mission
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Research Excellence</h4>
                    <p className="text-gray-700">Conduct rigorous analysis of global markets to identify sustainable competitive advantages and investment opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Systematic Implementation</h4>
                    <p className="text-gray-700">Deploy disciplined, systematic strategies that remove emotional bias and maintain consistency across market cycles.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 mb-2">Client Partnership</h4>
                    <p className="text-gray-700">Build long-term relationships with sophisticated investors through transparency, communication, and aligned interests.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">15+</div>
                <div className="text-navy-700">Years Combined Experience</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">Global</div>
                <div className="text-navy-700">Market Coverage</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">24/7</div>
                <div className="text-navy-700">Market Monitoring</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">Systematic</div>
                <div className="text-navy-700">Approach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}