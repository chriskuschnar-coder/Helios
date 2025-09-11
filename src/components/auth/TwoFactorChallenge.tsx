import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail
}) => {
  const { complete2FA } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(true)
  const [demoCode, setDemoCode] = useState('')

  useEffect(() => {
    // Auto-send email code on mount
    sendVerificationCode()
  }, [])

  const sendVerificationCode = async () => {
    setSendingCode(true)
    setError('')

    try {
      console.log('📧 Sending email verification code to:', userEmail)
      
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

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
          method: 'email',
          email: userEmail
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      console.log('✅ Verification code sent successfully')
      setSuccess(`Verification code sent to ${userEmail}`)
      setCodeSent(true)
      
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
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
      
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          code: verificationCode,
          method: 'email',
          email: userEmail
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Invalid verification code')
      }

      const result = await response.json()
      
      if (result.valid) {
        console.log('✅ 2FA verification successful')
        setSuccess('Verification successful!')
        
        // Complete the login process
        const completeResult = await complete2FA(verificationCode)
        if (completeResult.error) {
          throw new Error(completeResult.error.message)
        }
        
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error('❌ 2FA verification failed:', error)
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setVerificationCode('')
    setError('')
    setSuccess('')
    await sendVerificationCode()
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
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
            Check your email: {userEmail}
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
              <div className="flex items-center justify-between">
                <span className="text-yellow-800 font-medium">Demo Code: {demoCode}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(demoCode)}
                  className="text-yellow-600 hover:text-yellow-700 text-sm"
                >
                  Copy
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
              disabled={sendingCode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Resend Code
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
          Contact support: <a href="mailto:info@globalmarketsconsulting.com" className="text-navy-600 hover:text-navy-700 font-medium">info@globalmarketsconsulting.com</a>
        </p>
      </div>
    </div>
  )
}