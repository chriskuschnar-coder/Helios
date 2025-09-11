import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react'

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
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [demoCode, setDemoCode] = useState('123456') // Always show demo code
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)

  // Generate and send code on mount
  useEffect(() => {
    console.log('🔐 2FA Challenge mounted - generating code for:', userEmail)
    sendVerificationCode()
  }, [])

  const sendVerificationCode = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please wait 5 minutes.')
      setCanResend(false)
      setTimeout(() => {
        setCanResend(true)
        setResendCount(0)
      }, 5 * 60 * 1000)
      return
    }

    setError('')
    setSuccess('')

    try {
      console.log('📧 Sending email verification code to:', userEmail)

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_id: userData.id,
          method: 'email',
          email: userEmail,
          phone: userData?.phone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('📧 SendGrid error:', errorData)
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      const result = await response.json()
      console.log('✅ Verification code sent successfully:', result)
      
      setSuccess(`Verification code sent to ${userEmail}`)
      setResendCount(prev => prev + 1)
      
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔍 Verifying 2FA code...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_id: userData.id,
          code: verificationCode,
          email: userEmail
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ 2FA verification error:', errorData)
        setError('Invalid verification code')
        setLoading(false)
        return
      }

      const result = await response.json()
      
      if (!result.valid) {
        setError('Invalid verification code')
        setLoading(false)
        return
      }
      
      console.log('✅ 2FA verification successful')
      setSuccess('Verification successful!')
      
      try {
        // Import and use the auth context
        const { useAuth } = await import('./AuthProvider')
        const authContext = useAuth()
        await authContext.complete2FA(verificationCode, userData, session)
        console.log('🎉 2FA complete, calling onSuccess')
        onSuccess()
      } catch (authError) {
        console.error('❌ Auth completion failed:', authError)
        setError('Authentication completion failed')
        setLoading(false)
      }
      
    } catch (error) {
      console.error('❌ 2FA verification failed:', error)
      setError(error instanceof Error ? error.message : 'Verification failed')
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!canResend) {
      setError('Please wait before requesting another code')
      return
    }
    
    setVerificationCode('')
    setError('')
    setSuccess('')
    await sendVerificationCode()
  }

  const useDemoCode = () => {
    setVerificationCode(demoCode)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600">
            Enter the verification code sent to your email
          </p>
        </div>

        {/* Email Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Verification Code Sent</span>
          </div>
          <p className="text-blue-800">
            Check your email: {userEmail}
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Demo Code Display - EXACTLY like your demo */}
        {demoCode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Demo Mode</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              For testing purposes, your verification code is:
            </p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-300">
              <span className="text-2xl font-bold font-mono text-yellow-900">{demoCode}</span>
              <button
                onClick={useDemoCode}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Use Code
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={verifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={resendCode}
              disabled={!canResend}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {!canResend ? `Wait ${5 - Math.floor(resendCount / 60)}min` : 'Resend Code'} ({resendCount}/3)
            </button>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need to update your email address or having trouble?
          </p>
          <p className="text-sm">
            Contact support: <a href="mailto:support@globalmarketsconsulting.com" className="text-navy-600 hover:text-navy-700 font-medium">support@globalmarketsconsulting.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}