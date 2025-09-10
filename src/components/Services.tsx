import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp, Eye, CheckCircle, ArrowRight, Award, Users } from 'lucide-react'

export function Services() {
  const investmentApproach = [
    {
      icon: Brain,
      title: 'Quantitative Research',
      description: 'Proprietary models analyzing market patterns, cross-asset relationships, and systematic inefficiencies across global markets.',
      details: 'Our research team employs advanced statistical methods, machine learning, and econometric analysis to identify persistent market anomalies and develop systematic strategies.'
    },
    {
      icon: Target,
      title: 'Risk-Adjusted Strategies',
      description: 'Systematic approaches designed to generate consistent risk-adjusted returns while preserving capital during adverse market conditions.',
      details: 'We implement multi-layered risk management frameworks, including volatility targeting, correlation monitoring, and dynamic hedging strategies.'
    },
    {
      icon: Shield,
      title: 'Global Diversification',
      description: 'Strategic allocation across asset classes, geographies, and market factors to reduce concentration risk and enhance portfolio resilience.',
      details: 'Our global perspective encompasses developed and emerging markets, alternative investments, and currency strategies to optimize risk-return profiles.'
    },
    {
      icon: Zap,
      title: 'Adaptive Execution',
      description: 'Dynamic strategy implementation that adapts to changing market regimes while maintaining disciplined adherence to investment principles.',
      details: 'We utilize regime detection models and market microstructure analysis to optimize timing and execution across various market environments.'
    }
  ]

  const researchAreas = [
    {
      title: 'Market Regime Analysis',
      description: 'Identifying structural shifts in market behavior and adapting strategies accordingly'
    },
    {
      title: 'Cross-Asset Momentum',
      description: 'Systematic approaches to capturing momentum across global equity, fixed income, and alternative markets'
    },
    {
      title: 'Volatility Strategies',
      description: 'Sophisticated volatility trading and hedging techniques for enhanced risk-adjusted returns'
    },
    {
      title: 'Currency & Macro',
      description: 'Global macro analysis and currency strategies based on fundamental and technical factors'
    }
  ]

  return (
    <>
      {/* Investment Philosophy Section */}
      <section id="approach" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Investment Philosophy & Approach
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our investment philosophy centers on systematic, research-driven strategies that seek to generate 
              consistent alpha through rigorous analysis and disciplined execution. We believe markets are 
              complex adaptive systems that require sophisticated tools and deep expertise to navigate successfully.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {investmentApproach.map((approach, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg group-hover:bg-navy-200 transition-all duration-200">
                    <approach.icon className="h-6 w-6 text-navy-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">
                      {approach.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {approach.description}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {approach.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Research Areas */}
          <div className="bg-navy-50 rounded-2xl p-8 lg:p-12 border border-navy-200">
            <div className="text-center mb-12">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
                Research & Strategy Focus Areas
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our research spans multiple disciplines and markets, combining academic rigor 
                with practical implementation to develop robust investment strategies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {researchAreas.map((area, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-serif text-lg font-bold text-navy-900 mb-3">
                    {area.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Market Insights & Research
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We share our market perspectives and research insights to contribute to the broader 
              investment community's understanding of global market dynamics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy-900 mb-3">
                Market Commentary
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Regular analysis of market conditions, regime changes, and structural shifts 
                affecting global investment opportunities.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy-900 mb-3">
                Strategy Papers
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                In-depth research on systematic strategies, factor investing, and 
                quantitative approaches to portfolio construction.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy-900 mb-3">
                Educational Content
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Educational materials on advanced investment concepts, risk management, 
                and institutional best practices.
              </p>
            </div>
          </div>

          {/* Professional Standards */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
                Professional Standards & Compliance
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-bold text-navy-900 mb-2">SEC Registered</h4>
                <p className="text-sm text-gray-600">Investment Advisor</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-navy-900 mb-2">SIPC Protected</h4>
                <p className="text-sm text-gray-600">Member Firm</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-navy-900 mb-2">CFA Institute</h4>
                <p className="text-sm text-gray-600">Member Professionals</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-gold-600" />
                </div>
                <h4 className="font-bold text-navy-900 mb-2">Institutional</h4>
                <p className="text-sm text-gray-600">Grade Operations</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}