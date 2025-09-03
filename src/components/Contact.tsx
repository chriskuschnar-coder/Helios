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
    <section id="contact" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-navy-100 rounded-full mb-6">
            <span className="text-navy-700 text-sm font-semibold">GET IN TOUCH</span>
          </div>
          <h2 className="font-display text-3xl lg:text-5xl font-bold text-slate-900 mb-6">
            Join the Quantitative Revolution
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Connect with our quantitative team to discuss institutional investment 
            opportunities and access our mathematical models for superior market performance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-8">
              Institutional Sales Contact
            </h3>
            <div className="space-y-8 mb-10">
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-lg">Direct Line</div>
                  <div className="text-slate-700 font-medium">+1 (212) 555-0123</div>
                  <div className="text-sm text-slate-500 mt-1">Monday - Friday, 8:00 AM - 6:00 PM EST</div>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-lg">Institutional Email</div>
                  <div className="text-slate-700 font-medium">info@globalmarketconsulting.com</div>
                  <div className="text-sm text-slate-500 mt-1">Qualified investors only</div>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-lg">Corporate Office</div>
                  <div className="text-slate-700 font-medium">
                    200 South Biscayne Boulevard, Suite 2800<br />
                    Miami, FL 33131
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Requirements */}
            <div className="bg-gradient-to-br from-navy-50 to-blue-50 rounded-2xl p-8 border border-navy-200/50">
              <h4 className="font-display text-xl font-bold text-slate-900 mb-6">
                Investment Requirements
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Qualified/Accredited Investors Only</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Minimum Investment: $250,000</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Complete Due Diligence Package Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8">
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-8">
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all duration-200 bg-white"
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all duration-200 bg-white"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all duration-200 bg-white"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all duration-200 bg-white"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-glow transform hover:scale-105"
              >
                Request Information Package
                <Send className="ml-3 h-5 w-5" />
              </button>
              <p className="text-xs text-slate-500 text-center mt-4">
                By submitting this form, you confirm you are a qualified investor and agree to receive investment materials.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}