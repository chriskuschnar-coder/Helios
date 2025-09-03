import { TrendingUp, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative z-10 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Global Market Consulting
              </span>
            </div>
            <p className="text-slate-300 mb-8 max-w-md leading-relaxed text-lg">
              Revolutionary quantitative investment management delivering superior 
              risk-adjusted returns through advanced mathematical models and 
              systematic market inefficiency exploitation.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+1 (212) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span>info@globalmarketconsulting.com</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-6 text-white">Investment Products</h3>
            <ul className="space-y-3 text-slate-300">
              <li><a href="#services" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Alpha Fund
              </a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Market Neutral
              </a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Momentum Portfolio
              </a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Risk Management
              </a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-6 text-white">Resources</h3>
            <ul className="space-y-3 text-slate-300">
              <li><a href="/portal" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Client Portal
              </a></li>
              <li><a href="#performance" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Performance
              </a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Quantitative Models
              </a></li>
              <li><a href="#contact" className="hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                Institutional Sales
              </a></li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 Global Market Consulting. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200">Risk Disclosures</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              <strong>Performance Disclaimer:</strong> Past performance is not indicative of future results. 
              Digital asset investments carry substantial risk including complete loss of capital. 
              Returns shown are net of all fees. Strategies involve leverage and derivatives which may amplify losses. 
              Only suitable for qualified institutional and accredited investors who can bear such risks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}