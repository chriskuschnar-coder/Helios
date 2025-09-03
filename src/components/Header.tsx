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
    { name: 'Performance', href: '#performance' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md border-b border-slate-200/50 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900">
              Global Market Consulting
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-navy-600 font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-navy-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            <button
              onClick={onNavigateToLogin}
              className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-glow transform hover:scale-105"
            >
              Client Portal
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-navy-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-slate-200/50">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-slate-600 hover:text-navy-600 font-medium rounded-lg hover:bg-slate-100 transition-colors"
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
                className="block w-full text-left px-3 py-2 text-navy-600 hover:text-navy-700 font-medium rounded-lg hover:bg-navy-50 transition-colors"
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