import { BarChart3, Shield, Briefcase, PieChart, Brain, Zap, Target, TrendingUp, Eye, CheckCircle } from 'lucide-react'

export function Services() {
  return (
    <>
      {/* Dashboard Preview Section */}
      <section id="services" className="relative bg-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const errorCode = e.currentTarget.error?.code
              console.error('Video loading failed:', errorCode ? `Error code: ${errorCode}` : 'Unknown error')
            }}
          >
            <source src="https://videos.pexels.com/video-files/5028622/5028622-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/5028622/5028622-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4">
              Your Portfolio, at a Glance
            </h2>
            <p className="text-xl text-navy-200 max-w-3xl mx-auto">
              Our dashboard shows every detail — your fund units, total value, and the overall 
              fund NAV — updated live as market conditions change. Everything is transparent, 
              accurate, and always accessible.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gold-600 hover:bg-gold-700 text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-lg">
              <Eye className="h-5 w-5" />
              <span>Explore Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button className="border-2 border-white text-white hover:bg-white hover:text-navy-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Sign Up Today</span>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Professional Expertise Meets Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team of experienced analysts and traders use real-time data and proven 
              strategies to manage investments with precision. We prioritize transparency, 
              security, and your growth as an investor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-all duration-200">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Live Portfolio Updates
              </h3>
              <p className="text-gray-600">
                Real-time fund NAV and portfolio tracking with instant market updates.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-all duration-200">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Automated Allocation
              </h3>
              <p className="text-gray-600">
                New investments automatically converted to fund units based on current NAV.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-all duration-200">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Clear Reporting
              </h3>
              <p className="text-gray-600">
                Detailed tracking of every transaction with complete transparency.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mb-4 group-hover:bg-navy-200 transition-all duration-200">
                <Shield className="h-8 w-8 text-navy-600" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">
                Secure & Compliant
              </h3>
              <p className="text-gray-600">
                Reliable, secure, and fully compliant systems you can trust.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
            <div className="text-center mb-12">
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-6">
                Start Investing Today
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Join Global Market Consulting and take advantage of a professional, transparent 
                investment platform. See your portfolio grow and manage your investments with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <button className="border-2 border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Request More Information</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-navy-900 mb-4 text-center">
                Contact Information
              </h4>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-lg font-bold text-navy-900 mb-1">Email</div>
                  <div className="text-gray-600">investors@globalmarketconsulting.com</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-navy-900 mb-1">Phone</div>
                  <div className="text-gray-600">+1 (555) 123-4567</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}