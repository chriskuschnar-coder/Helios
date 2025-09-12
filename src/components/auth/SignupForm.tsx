import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft, X, Phone } from 'lucide-react'
import { Logo } from '../Logo'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onBackToHome?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin, onBackToHome }) => {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '')
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
  ]

  const isPasswordValid = passwordRequirements.every(req => req.met)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service')
      setLoading(false)
      return
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone
      })
      
      if (result.error) {
        setError(result.error.message)
      } else if (result.showWelcome) {
        // Show welcome page instead of immediately calling onSuccess
        onSuccess?.(result.userData)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
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
          <Logo size="xl" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
          Global Markets Consulting
        </h1>
        <p className="text-gray-600">
          Create your investment account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors bg-white"
            placeholder="Enter your full name"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional - for SMS backup codes)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors bg-white"
            placeholder="(555) 123-4567"
            maxLength={14}
            autoComplete="tel"
          />
          <p className="text-xs text-gray-500 mt-1">
            <strong>Recommended:</strong> Add phone number for SMS backup when email verification is unavailable
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors bg-white"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
          <p className="text-xs text-gray-500 mt-1">Primary method for account notifications</p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors bg-white"
              placeholder="Create a password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
          
          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-xs">
                  {req.met ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                  ) : (
                    <div className="h-3 w-3 border border-gray-300 rounded-full mr-2" />
                  )}
                  <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors bg-white"
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
          
          {formData.confirmPassword && (
            <div className="mt-2 flex items-center text-xs">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                  <span className="text-green-600">Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500 mr-2" />
                  <span className="text-red-600">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-navy-600 hover:text-navy-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-navy-600 hover:text-navy-700 underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid || !passwordsMatch || !agreedToTerms}
          className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 text-lg min-h-[52px] shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-navy-600 hover:text-navy-700 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}