export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            About Global Market Consulting
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A premier investment management firm delivering institutional-grade strategies 
            and risk management for sophisticated investors seeking consistent alpha generation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mb-6">
              Our Investment Philosophy
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-2">Systematic Approach</h4>
                  <p className="text-gray-600">
                    Our quantitative models analyze thousands of data points to identify 
                    market inefficiencies and generate consistent alpha across market cycles.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-2">Risk Management</h4>
                  <p className="text-gray-600">
                    Advanced risk controls and position sizing ensure capital preservation 
                    while maximizing risk-adjusted returns through all market conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 mb-2">Institutional Execution</h4>
                  <p className="text-gray-600">
                    Professional-grade execution and reporting provide transparency 
                    and accountability that institutional investors demand.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">
              Firm Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Assets Under Management</span>
                <span className="font-bold text-navy-900">$4.2M</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Inception Date</span>
                <span className="font-bold text-navy-900">January 2023</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Investment Minimum</span>
                <span className="font-bold text-navy-900">$100,000</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Management Fee</span>
                <span className="font-bold text-navy-900">2.0%</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Performance Fee</span>
                <span className="font-bold text-navy-900">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}