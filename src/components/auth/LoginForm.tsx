import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { TrendingUp, Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft, X } from 'lucide-react'
import { TwoFactorChallenge } from './TwoFactorChallenge'

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
  const [show2FA, setShow2FA] = useState(false)
  const [pendingAuth, setPendingAuth] = useState<{ userData: any; session: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login for:', email)
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('❌ Login failed:', result.error.message)
        setError(result.error.message)
        setLoading(false)
      } else if (result.requires2FA) {
        console.log('🔐 2FA REQUIRED - login successful, 2FA challenge will show')
        setLoading(false)
        // Don't call onSuccess yet - wait for 2FA completion
      } else {
        console.log('✅ Login successful, no 2FA required')
        setLoading(false)
        onSuccess?.()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error - please try again')
      setLoading(false)
    }
  }

  const handle2FASuccess = () => {
    console.log('✅ 2FA verification successful')
    setShow2FA(false)
    setPendingAuth(null)
    onSuccess?.()
  }

  const handle2FACancel = () => {
    console.log('❌ 2FA cancelled')
    setShow2FA(false)
    setPendingAuth(null)
    setLoading(false)
  }

  if (show2FA) {
    return (
      <TwoFactorChallenge
        onSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
        userEmail={email}
        userData={pendingAuth?.userData}
        session={pendingAuth?.session}
      />
    )
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      {/* Back to Home Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <button
          onClick={onBackToHome}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200">
            <img 
              src="/logo.png" 
              alt="Global Markets Consulting" 
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
          Global Markets Consulting
        </h1>
        <p className="text-base text-gray-600">
          Sign in to your investment account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-base">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors text-lg bg-white"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors text-lg bg-white"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 w-5 h-5 mr-3"
            />
            <span className="text-base text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-base text-navy-600 hover:text-navy-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 text-lg min-h-[52px] shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-base text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-navy-600 hover:text-navy-700 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}