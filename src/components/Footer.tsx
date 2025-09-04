import { useState } from 'react'

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Nautilus</h3>
            <p className="text-navy-200 mb-4">
              Where code becomes capital. Where algorithms build empires. 
              Where your future runs on autopilot.
            </p>
            <div className="text-sm text-navy-300">
              <div>SEC Registered Investment Advisor</div>
              <div>SIPC Member</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">The Machine</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Pattern Recognition</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Execution Engine</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Systems</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Learning AI</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Intelligence</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Performance Reports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Algorithm Updates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Intelligence</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
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
                <div>Email: access@nautilus.capital</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-navy-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-navy-300 mb-4 md:mb-0">
              © 2025 Nautilus Capital Technologies LLC. All rights reserved.
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
              Past performance does not guarantee future results. Nautilus is designed for qualified investors 
              who understand and can bear investment risks. All returns shown are net of fees and expenses.
            </p>
            <p>
              Nautilus represents advanced quantitative technology. Please consult with your financial advisor to determine 
              if algorithmic trading strategies are suitable for your financial situation and investment objectives. 
              This website does not constitute investment advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}