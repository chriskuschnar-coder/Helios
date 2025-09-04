import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to discuss your investment goals? Contact our team for a confidential consultation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mb-6">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-gold-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Email</h4>
                  <p className="text-gray-600">contact@globalmarketsconsulting.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-gold-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Phone</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-gold-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-navy-900 mb-1">Office</h4>
                  <p className="text-gray-600">
                    123 Financial District<br />
                    New York, NY 10004
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-navy-900 mb-3">Office Hours</h4>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                <p>Saturday: 9:00 AM - 2:00 PM EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Tell us about your investment goals and how we can help..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gold-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gold-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}