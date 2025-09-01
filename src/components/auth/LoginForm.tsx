import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { TrendingUp, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
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

    console.log('🔐 Login form submitted with:', { email, password: '***' })

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        console.log('❌ Login failed:', result.error.message)
        setError(result.error.message)
      } else {
        console.log('✅ Login successful, calling onSuccess')
        onSuccess?.()
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Connection error - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">
          Sign in to your investment account
        </p>
      </div>

      <SupabaseConnectionBanner />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-navy-600 hover:text-navy-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-navy-600 hover:text-navy-700 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="mt-8 p-4 bg-navy-50 rounded-lg">
        <h3 className="font-medium text-navy-900 mb-2">Demo Account</h3>
        <p className="text-sm text-navy-700 mb-2">
          For testing in Bolt editor only (single device):
        </p>
        <div className="text-sm font-mono bg-white p-2 rounded border">
          <div>Email: demo@globalmarket.com</div>
          <div>Password: demo123456</div>
        </div>
        <p className="text-xs text-navy-600 mt-2">
          For cross-device login: Connect to Supabase using the button in top right of Bolt.
        </p>
      </div>
    </div>
  )
}