import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userData: any
  session: any
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userData,
  session
}) => {
  const { complete2FA } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sendingCode, setSendingCode] = useState(true)
  const [demoCode, setDemoCode] = useState('')
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)

  useEffect(() => {
    if (userData && session) {
      console.log('🔐 2FA Challenge mounted - sending verification code to:', userData.email)
      sendVerificationCode()
    } else {
      console.error('❌ No user data or session provided')
      setError('Authentication data missing')
    }
  }, [userData, session])

  const sendVerificationCode = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please wait 5 minutes.')
      setCanResend(false)
      setTimeout(() => {
        setCanResend(true)
        setResendCount(0)
      }, 5 * 60 * 1000) // 5 minutes
      return
    }

    setSendingCode(true)
    setError('')
    setSuccess('')

    try {
      console.log('📧 Sending email verification code to:', userData.email)

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          email: userData.email,
          user_id: userData.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('📧 SendGrid error:', errorData)
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      const result = await response.json()
      console.log('✅ Verification code sent successfully:', result)
      
      if (result.email_sent) {
        setSuccess(`Verification code sent to ${userData.email}`)
      } else if (result.sms_sent) {
        setSuccess(`Verification code sent via SMS (email failed)`)
      } else {
        setSuccess(`Code generated (delivery may have failed)`)
      }
      
      setResendCount(prev => prev + 1)
      
      // Show demo code for testing
      if (result.demo_code) {
        setDemoCode(result.demo_code)
        console.log('🔑 Demo code for testing:', result.demo_code)
      }
      
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
      
      // For testing, generate a demo code even if email fails
      const testCode = Math.floor(100000 + Math.random() * 900000).toString()
      setDemoCode(testCode)
      console.log('🔑 Using demo code due to email failure:', testCode)
      setSuccess(`Email sending failed - using demo code: ${testCode}`)
    } finally {
      setSendingCode(false)
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
      
      // Call verify-2fa-code function directly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      const completeResult = await complete2FA(verificationCode, userData, session)
      
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingAuth?.session?.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          code: verificationCode,
          email: pendingAuth?.userData?.email,
          user_id: pendingAuth?.userData?.id
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
      
      // CRITICAL: Complete the 2FA process by calling the complete2FA function
      try {
        console.log('🔐 Completing 2FA authentication...')
        const completeResult = await complete2FA(verificationCode, userData, session)
        
        if (completeResult.success) {
          console.log('✅ 2FA completion successful')
          
          // Clear pending auth data
          localStorage.removeItem('pending_2fa_session')
          
          setTimeout(() => {
            console.log('🎉 2FA complete, calling onSuccess')
            onSuccess()
          }, 1000)
        } else {
          throw new Error('2FA completion failed')
        }
      } catch (completeError) {
        console.error('❌ 2FA completion error:', completeError)
        setError('Authentication completion failed. Please try again.')
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
            {sendingCode ? 'Sending verification code...' : 'Enter the verification code sent to your email'}
          </p>
        </div>

        {/* Email Status */}
        {!sendingCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Verification Code Sent</span>
            </div>
            <p className="text-blue-800">
              Check your email: {userData?.email}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-900 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">{success}</span>
            </div>
          </div>
        )}

        {sendingCode ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Sending verification code to your email...</p>
          </div>
        ) : (
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

            {demoCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Demo Mode</span>
                </div>
                <p className="text-xs text-yellow-800 mb-2">
                  For testing purposes, your verification code is:
                </p>
                <div className="flex items-center justify-between">
                  <code className="bg-white px-3 py-1 rounded border text-lg font-mono font-bold text-yellow-900">
                    {demoCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(demoCode)
                      setVerificationCode(demoCode)
                    }}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    Use Code
                  </button>
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
                disabled={sendingCode || !canResend}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {!canResend ? `Wait ${5 - Math.floor(resendCount / 60)}min` : 'Resend Code'} ({resendCount}/3)
              </button>
            </div>
          </div>
        )}

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