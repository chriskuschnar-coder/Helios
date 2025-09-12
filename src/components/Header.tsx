import { useState } from 'react'
import { Menu, X, TrendingUp } from 'lucide-react'
import { Logo } from './Logo'
import { Logo } from './Logo'

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
          <Logo size="large" showText={true} />

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