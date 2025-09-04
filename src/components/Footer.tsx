import { Mail, Phone, MapPin, TrendingUp } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-8 w-8 text-gold-600" />
              <span className="font-serif text-xl font-bold">
                Global Market Consulting
              </span>
            </div>
            <p className="text-navy-200 mb-6 max-w-md">
              Professional investment management delivering institutional-grade 
              strategies and consistent alpha generation for sophisticated investors.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold-600" />
                <span className="text-navy-200">contact@globalmarketsconsulting.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold-600" />
                <span className="text-navy-200">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gold-600" />
                <span className="text-navy-200">123 Financial District, New York, NY 10004</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#services" className="hover:text-gold-400 transition-colors">Investment Management</a></li>
              <li><a href="#services" className="hover:text-gold-400 transition-colors">Risk Management</a></li>
              <li><a href="#services" className="hover:text-gold-400 transition-colors">Portfolio Optimization</a></li>
              <li><a href="#performance" className="hover:text-gold-400 transition-colors">Performance Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#about" className="hover:text-gold-400 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-gold-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-navy-300 text-sm">
              © 2025 Global Market Consulting. All rights reserved.
            </p>
            <p className="text-navy-300 text-sm mt-4 md:mt-0">
              SEC Registered Investment Advisor • SIPC Protected
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}