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