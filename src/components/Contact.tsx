import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Users, Shield } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    investmentAmount: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Join the Quantitative Revolution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with our quantitative team to discuss institutional investment 
            opportunities and access our mathematical models for superior market performance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mb-6">
              Institutional Sales Contact
            </h3>
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-navy-600" />
                </div>
                <div>
                  <div className="font-medium text-navy-900">Direct Line</div>
                  <div className="text-gray-600">+1 (212) 555-0123</div>
                  <div className="text-sm text-gray-500">Monday - Friday, 8:00 AM - 6:00 PM EST</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-navy-600" />
                </div>
                <div>
                  <div className="font-medium text-navy-900">Institutional Email</div>
                  <div className="text-gray-600">info@globalmarketconsulting.com</div>
                  <div className="text-sm text-gray-500">Qualified investors only</div>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-navy-600" />
                </div>
                <div>
                  <div className="font-medium text-navy-900">Corporate Office</div>
                  <div className="text-gray-600">
                    200 South Biscayne Boulevard, Suite 2800<br />
                    Miami, FL 33131
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Requirements */}
            <div className="bg-navy-50 rounded-lg p-6">
              <h4 className="font-serif text-lg font-bold text-navy-900 mb-4">
                Investment Requirements
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-navy-600" />
                  <span className="text-gray-700">Qualified/Accredited Investors Only</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-navy-600" />
                  <span className="text-gray-700">Minimum Investment: $250,000</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-navy-600" />
                  <span className="text-gray-700">Complete Due Diligence Package Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">
              Request Investment Information
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Institution/Family Office
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount Range
                </label>
                <select
                  id="investmentAmount"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">Select Range</option>
                  <option value="250k-500k">$250K - $500K</option>
                  <option value="500k-1m">$500K - $1M</option>
                  <option value="1m-5m">$1M - $5M</option>
                  <option value="5m+">$5M+</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Objectives
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your investment objectives and any specific questions about our quantitative strategies..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center"
              >
                Request Information Package
                <Send className="ml-2 h-5 w-5" />
              </button>
              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you confirm you are a qualified investor and agree to receive investment materials.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}