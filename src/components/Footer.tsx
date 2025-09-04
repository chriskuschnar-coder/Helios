import { useState } from 'react'

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">HELIOS</h3>
            <p className="text-navy-200 mb-4">
              Where code becomes capital. Where algorithms build empires. 
              Where your future runs on autopilot.
            </p>
            <div className="text-sm text-navy-300">
              <div>Institutional-Grade Technology</div>
              <div>Military-Grade Security</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">HELIOS Systems</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Intelligence</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Execution</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Learning System</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Pattern Recognition</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Microstructure</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Execution Algorithms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Management</a></li>
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
              © 2025 HELIOS Technologies LLC. All rights reserved.
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