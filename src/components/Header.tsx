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
            <div className="w-8 h-8 bg-white rounded border border-gray-200 p-1">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20 80 L35 65 L50 50 L65 35 L80 20" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M20 20 L35 35 L50 50 L65 65 L80 80" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M70 20 L80 20 L80 30" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M70 80 L80 80 L80 70" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-bold text-navy-900">
              GMC
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
              className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Professional Portal
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
                  onNavigateToLogin?.()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 text-navy-600 hover:text-navy-700 font-medium"
              >
                Professional Portal
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}