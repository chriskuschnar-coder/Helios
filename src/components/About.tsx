import { Award, Globe, Users, Target, Brain, Zap, Shield, BarChart3 } from 'lucide-react'

export function About() {
  const features = [
    {
      icon: Brain,
      title: 'Quantitative Architecture',
      description: '$2.8M investment in proprietary quantitative research and infrastructure development.'
    },
    {
      icon: Zap,
      title: 'Market Microstructure',
      description: 'Processing 50,000+ tick-level events per second across primary liquidity venues.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced VaR modeling with Monte Carlo simulation and real-time stress testing.'
    },
    {
      icon: BarChart3,
      title: 'Proven Performance',
      description: 'Consistent profitability across 4 institutional accounts with 287% average growth.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Proven Investment Excellence Through Advanced Analytics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Led by a team of seasoned professionals with backgrounds in finance, mathematics, and technology, 
            we combine academic research with practical market insights to drive investment success. 
            Our proven track record demonstrates consistent value creation for our clients.
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
                Advanced Quantitative Models
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>VPIN Implementation:</strong> Proprietary Volume-Synchronized Probability 
                  of Informed Trading framework with machine learning enhancement calibrated on 
                  119,000+ trade samples.
                </p>
                <p>
                  <strong>Hidden Markov Models:</strong> Four-state regime detection with Gaussian 
                  emissions for real-time market state identification and probabilistic forecasting.
                </p>
                <p>
                  <strong>Statistical Arbitrage:</strong> Ornstein-Uhlenbeck process calibration 
                  with cointegration testing via Johansen methodology for pairs trading strategies.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">50K+</div>
                <div className="text-navy-700">Events/Second</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">99.97%</div>
                <div className="text-navy-700">System Uptime</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-navy-900 mb-2">2.4TB</div>
                <div className="text-navy-700">Daily Data</div>
              </div>
              <div className="bg-navy-50 rounded-lg p-6 text-center border border-navy-200">
                <div className="font-serif text-3xl font-bold text-gold-600 mb-2">500+</div>
                <div className="text-navy-700">Real-time Factors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}