import React, { useState } from 'react'
import { TrendingUp, Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onLogin: (credentials: { email: string; password: string }) => void
  onBack: () => void
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Demo credentials check
      if (email === 'client@globalmarket.com' && password === 'quantitative2025') {
        onLogin({ email, password })
      } else {
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-navy-600" />
              <span className="font-serif text-xl font-bold text-navy-900">
                Global Market Consulting
              </span>
            </div>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-700 hover:text-navy-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Site</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
                Client Portal Access
              </h1>
              <p className="text-gray-600">
                Secure login for institutional investors
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent pr-12 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Access Portal'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-navy-50 rounded-lg">
              <h3 className="font-medium text-navy-900 mb-2">Demo Access</h3>
              <p className="text-sm text-navy-700 mb-2">
                Use these credentials to explore the client portal:
              </p>
              <div className="text-sm font-mono bg-white p-2 rounded border">
                <div>Email: client@globalmarket.com</div>
                <div>Password: quantitative2025</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Having trouble accessing your account?{' '}
                <a href="#contact" className="text-navy-600 hover:text-navy-700">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}