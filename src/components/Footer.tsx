import { useState } from 'react'

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Global Markets Consulting</h3>
            <p className="text-navy-200 mb-4 leading-relaxed">
              A boutique investment advisory firm specializing in systematic strategies 
              and quantitative research for sophisticated investors navigating global markets.
            </p>
            <div className="text-sm text-navy-300 space-y-1">
              <div>SEC Registered Investment Advisor</div>
              <div>SIPC Member Firm</div>
              <div>CFA Institute Members</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Research Areas</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Quantitative Strategies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Global Macro Analysis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Microstructure</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Professional Resources</h4>
            <ul className="space-y-2 text-navy-200">
              <li><a href="#" className="hover:text-white transition-colors">Market Commentary</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Educational Content</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Industry Insights</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Professional Contact</h4>
            <div className="space-y-2 text-navy-200">
              <div>200 South Biscayne Boulevard</div>
              <div>Suite 2800</div>
              <div>Miami, FL 33131</div>
              <div className="mt-4 space-y-1">
                <div>Phone: (305) 555-0123</div>
                <div>Email: info@globalmarkets.com</div>
              </div>
              <div className="mt-4 pt-4 border-t border-navy-700">
                <p className="text-sm text-navy-300">
                  <strong>Professional Inquiries Only:</strong><br />
                  Existing accredited contacts may access our 
                  private portal for investment documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-navy-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-navy-300 mb-4 md:mb-0">
              © 2025 Global Markets Consulting LLC — Professional Investment Advisory Services
            </div>
            <div className="flex space-x-6 text-sm text-navy-300">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Regulatory Disclosures</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-navy-800 text-xs text-navy-400 leading-relaxed">
            <p className="mb-4">
              <strong>Important Regulatory Disclosure:</strong> Global Markets Consulting LLC is a registered investment advisor. 
              This website is for informational purposes only and does not constitute an offer to sell or a solicitation 
              to buy any securities or investment advisory services. Any such offer or solicitation will be made only 
              through definitive offering documents to qualified investors.
            </p>
            <p className="mb-4">
              <strong>Accredited Investor Notice:</strong> Investment opportunities, if any, are available only to accredited 
              investors as defined under federal securities laws. Past performance does not guarantee future results. 
              All investments carry risk of loss, including potential loss of principal.
            </p>
            <p>
              <strong>Professional Use Only:</strong> The information contained herein is intended solely for sophisticated, 
              professional investors and should not be relied upon by any other persons. Please consult with qualified 
              legal, tax, and financial advisors before making any investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}