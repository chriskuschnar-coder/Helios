import { useState } from 'react'
import { Menu, X, TrendingUp } from 'lucide-react'

interface HeaderProps {
  onNavigateToLogin?: () => void
}

export function Header({ onNavigateToLogin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Strategies', href: '#services' },
  ]

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-navy-600" />
            <span className="font-serif text-xl font-bold text-navy-900">
              Nautilus
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
              onClick={onNavigateToLogin}
              className="bg-gold-600 hover:bg-gold-700 text-navy-900 px-8 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Client Portal
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-navy-600"
          <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GMC</span>
          </div>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            Global Markets Consulting
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
                  onNavigateToLogin?.()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 text-gold-600 hover:text-gold-700 font-bold"
              >
                Client Portal
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}