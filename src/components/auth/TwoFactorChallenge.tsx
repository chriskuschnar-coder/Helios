import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
  userData: any
  session: any
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail,
  userData,
  session
}) => {
  const { complete2FA } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  // Auto-focus and format code input
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').substring(0, 6)
    setVerificationCode(numericValue)
    setError('') // Clear error when user starts typing
  }

  // Handle Enter key submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && !loading) {
      verifyCode()
    }
  }

  // Resend countdown timer
  useEffect(() => {
    if (!canResend && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0) {
      setCanResend(true)
      setResendCountdown(60)
    }
  }, [canResend, resendCountdown])

  // Generate and send code on mount
  useEffect(() => {
    console.log('🔐 2FA Challenge mounted - sending verification code to:', userEmail)
    sendVerificationCode()
  }, [])

  const sendVerificationCode = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please wait 5 minutes before trying again.')
      setCanResend(false)
      setTimeout(() => {
        setCanResend(true)
        setResendCount(0)
      }, 5 * 60 * 1000)
      return
    }

    setError('')
    setSuccess('')
    setEmailSent(false)

    try {
      console.log('📧 Sending verification code to:', userEmail)

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: userData?.id,
          method: 'email',
          email: userEmail,
          phone: userData?.phone || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      const result = await response.json()
      console.log('✅ Verification code sent successfully')
      
      setEmailSent(true)
      setSuccess(`Verification code sent to ${userEmail}`)
      setResendCount(prev => prev + 1)
      setCanResend(false)
      setResendCountdown(60)
      
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code')
      return
    }

    if (!userData?.id) {
      setError('Authentication session expired. Please sign in again.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Verifying 2FA code for user:', userData.id)
      
      // Use AuthProvider's complete2FA method for proper session handling
      const result = await complete2FA(verificationCode, userData, session)
      
      if (result.success) {
        console.log('✅ 2FA verification and session setup complete')
        setSuccess('Verification successful! Redirecting to your account...')
        
        // Delay to show success message, then redirect
        setTimeout(() => {
          setLoading(false)
          console.log('🎉 Calling onSuccess - will check subscription agreement status')
          onSuccess()
        }, 1500)
      } else {
        throw new Error('Verification failed')
      }
      
    } catch (error) {
      console.error('❌ 2FA verification failed:', error)
      setError(error instanceof Error ? error.message : 'Invalid verification code. Please try again.')
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!canResend) {
      setError(`Please wait ${resendCountdown} seconds before requesting another code`)
      return
    }
    
    setVerificationCode('')
    setError('')
    setSuccess('')
    await sendVerificationCode()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Sign In</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-navy-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Enter the 6-digit verification code sent to your email address
            </p>
          </div>

          {/* Email Status */}
          {emailSent && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-in fade-in duration-500">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Verification Code Sent</h3>
                  <p className="text-sm text-blue-700">
                    Check your email: <span className="font-medium">{userEmail}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-in fade-in duration-500">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-900 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-in fade-in duration-300">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Verification Code Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 text-center text-3xl font-mono font-bold border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 tracking-widest bg-gray-50 focus:bg-white"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Verify Button */}
            <button
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Verify Code</span>
                </>
              )}
            </button>

            {/* Resend Section */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              {canResend ? (
                <button
                  onClick={resendCode}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors hover:underline"
                >
                  Resend Verification Code
                </button>
              ) : (
                <div className="text-sm text-gray-500">
                  Resend available in <span className="font-mono font-bold text-blue-600">{resendCountdown}s</span>
                </div>
              )}
              {resendCount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Attempts: {resendCount}/3
                </p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Security Notice</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Never share your verification code with anyone</li>
                    <li>• This code expires in 10 minutes</li>
                    <li>• If you didn't request this, contact support immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact{' '}
              <a 
                href="mailto:support@globalmarketsconsulting.com" 
                className="text-navy-600 hover:text-navy-700 font-medium transition-colors"
              >
                support@globalmarketsconsulting.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}