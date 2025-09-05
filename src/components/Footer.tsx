import { useState } from 'react'

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Global Market Consulting</h3>
            <p className="text-navy-200 mb-4">
              Empowering investors to navigate complex markets with confidence through 
              cutting-edge quantitative strategies and superior risk-adjusted returns.
            </p>
            <div className="text-sm text-navy-300">
              <div>SEC Registered Investment Advisor</div>
              <div>SIPC Member</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Investment Products</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Alpha Fund</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Neutral</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Momentum Portfolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Management</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Performance Reports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Commentary</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Educational Content</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-navy-200">
              <div>200 South Biscayne Boulevard</div>
              <div>Suite 2800</div>
              <div>Miami, FL 33131</div>
              <div className="mt-4">
                <div>Phone: (305) 555-0123</div>
                <div>Email: info@globalmarket.com</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-navy-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-navy-300 mb-4 md:mb-0">
              © 2025 Global Market Consulting — Clear, Transparent, Professional Investing.
            </div>
            <div className="flex space-x-6 text-sm text-navy-300">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosures</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-navy-800 text-xs text-navy-400 leading-relaxed">
            <p className="mb-2">
              <strong>Important Investment Disclaimer:</strong> All investments carry risk including potential loss of principal. 
              Past performance does not guarantee future results. Our strategies are designed for qualified investors 
              who understand and can bear investment risks. Returns shown are net of all fees and expenses.
            </p>
            <p>
              Please consult with your financial advisor to determine if our investment strategies are suitable for your 
              financial situation and investment objectives. This website does not constitute investment advice or a 
              recommendation to buy or sell any security.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}