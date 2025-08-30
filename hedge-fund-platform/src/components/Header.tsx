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
    { name: 'Client Portal', href: '#portal', onClick: true },
    { name: 'Contact', href: '#contact' },
  ]

  const handlePortalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onNavigateToLogin) {
      onNavigateToLogin()
    }
  }

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    if (item.onClick) {
      handlePortalClick(e)
    }
  }
  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
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
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={(e) => handleNavClick(item, e)}
                  className="text-gray-700 hover:text-navy-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </button>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-navy-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              )
            ))}
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
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      handleNavClick(item, e)
                      setIsMenuOpen(false)
                    }}
                    className="block px-3 py-2 text-gray-700 hover:text-navy-600 font-medium text-left w-full"
                  >
                    {item.name}
                  </button>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-navy-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}