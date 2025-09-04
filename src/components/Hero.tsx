import { useState } from 'react'
import { Menu, X, TrendingUp, ArrowRight, Play, Shield, Award, CheckCircle } from 'lucide-react'

export function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Strategies', href: '#services' },
    { name: 'Performance', href: '#performance' },
    { name: 'Contact', href: '#contact' },
  ]

  const handleLoginClick = () => {
    window.location.href = '/login'
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/6774266/6774266-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        {/* Light overlay to keep text readable but video prominent */}
        <div className="absolute inset-0 bg-black bg-opacity-25"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-navy-600" />
              <span className="font-serif text-xl font-bold text-navy-900">
                Global Market Consulting
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-navy-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
              <button
                onClick={handleLoginClick}
                className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Client Portal
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-navy-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-navy-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <button
                  onClick={() => {
                    handleLoginClick()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-navy-600 hover:text-navy-700 font-medium"
                >
                  Client Portal
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Professional{' '}
            <span className="text-gold-400">Investment Management</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Delivering consistent alpha through systematic strategies, rigorous risk management, 
            and institutional-grade execution for sophisticated investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleLoginClick}
              className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Access Client Portal
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-3">
              <Play className="w-5 h-5" />
              Watch Overview
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <Shield className="w-6 h-6 text-gold-400" />
              <span className="font-medium">SEC Registered</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <Award className="w-6 h-6 text-gold-400" />
              <span className="font-medium">SIPC Protected</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <CheckCircle className="w-6 h-6 text-gold-400" />
              <span className="font-medium">Institutional Grade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}