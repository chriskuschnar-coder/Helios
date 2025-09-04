import { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="relative py-20 bg-gray-50 overflow-hidden">
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
          <source src="https://videos.pexels.com/video-files/3196284/3196284-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3196284/3196284-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Ready to discuss your investment goals? Our team is here to provide personalized 
            guidance and answer any questions about our strategies.
          </p>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-8">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Office Address</h4>
                  <p className="text-gray-200">
                    200 South Biscayne Boulevard<br />
                    Suite 2800<br />
                    Miami, FL 33131
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Phone</h4>
                  <p className="text-gray-200">(305) 555-0123</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Email</h4>
                  <p className="text-gray-200">info@globalmarket.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Business Hours</h4>
                  <p className="text-gray-200">
                    Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                    Saturday: 10:00 AM - 2:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/20 backdrop-blur-sm rounded-xl">
              <h4 className="font-semibold text-white mb-2">Investment Minimums</h4>
              <p className="text-gray-200 text-sm">
                Our strategies are designed for qualified investors with minimum investments 
                starting at $100,000. Please contact us to discuss your specific requirements 
                and investment objectives.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-navy-900 mb-6">
                Schedule a Consultation
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="Your full name"
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
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your investment goals and how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-navy-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-700 transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                We typically respond within 24 hours during business days.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}