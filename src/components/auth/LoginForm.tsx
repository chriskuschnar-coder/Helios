import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { TrendingUp, Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft, X } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  onBackToHome?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, onBackToHome }) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mobile-card">
      {/* Back to Home Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors mobile-button"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <button
          onClick={onBackToHome}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors mobile-button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-navy-600 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
        </div>
        <h1 className="font-serif text-xl md:text-2xl font-bold text-navy-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Sign in to your investment account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm md:text-base">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors text-base"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm md:text-base font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 md:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors text-base"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors mobile-button"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 w-4 h-4"
            />
            <span className="ml-2 text-sm md:text-base text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm md:text-base text-navy-600 hover:text-navy-700 transition-colors mobile-button"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 md:py-4 rounded-lg font-medium transition-colors duration-200 mobile-button active:scale-95 text-base"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm md:text-base text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-navy-600 hover:text-navy-700 font-medium transition-colors mobile-button"
          >
            Sign up
          </button>
        </p>
      </div>

    </div>
  )
}