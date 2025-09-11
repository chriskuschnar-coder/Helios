import React, { useState, useEffect } from 'react'
import { Shield, Mail, Fingerprint, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Copy, Smartphone, Clock } from 'lucide-react'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
  userPhone?: string
  preferredMethod?: 'email' | 'sms' | 'biometric'
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail,
  userPhone,
  preferredMethod = 'email'
}) => {
  const [method, setMethod] = useState<'email' | 'sms' | 'biometric'>(preferredMethod)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes

  useEffect(() => {
    checkBiometricSupport()
    // Auto-send code based on preferred method
    if (preferredMethod === 'email' || preferredMethod === 'sms') {
      sendVerificationCode(preferredMethod)
    }
  }, [])

  useEffect(() => {
    // Countdown timer for code expiration
    if (codeSent && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [codeSent, timeRemaining])

  const checkBiometricSupport = async () => {
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricSupported(available)
        console.log('🔐 Biometric authentication available:', available)
      }
    } catch (error) {
      console.log('🔐 Biometric check failed:', error)
      setBiometricSupported(false)
    }
  }

  const sendVerificationCode = async (selectedMethod: 'email' | 'sms') => {
    setLoading(true)
    setError('')

    try {
      console.log(`📱 Sending ${selectedMethod} verification code...`)
      
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
          method: selectedMethod,
          email: userEmail,
          phone: userPhone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send verification code')
      }

      const result = await response.json()
      console.log('✅ Verification code sent successfully')
      
      setCodeSent(true)
      setTimeRemaining(600) // Reset timer
      setSuccess(`Verification code sent to ${selectedMethod === 'email' ? userEmail : userPhone}`)
      
      // For demo purposes, show the code in console
      if (result.demo_code) {
        console.log('🔑 Demo verification code:', result.demo_code)
      }
      
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const verifyBiometric = async () => {
    setLoading(true)
    setError('')

    try {
      // Check for stored credential
      const credentialId = localStorage.getItem('biometric_credential_id')
      if (!credentialId) {
        throw new Error('No biometric credential found. Please set up biometric authentication first.')
      }

      // Verify using WebAuthn
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: new TextEncoder().encode(credentialId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000
        }
      })

      if (assertion) {
        console.log('🔐 Biometric verification successful')
        setSuccess('Biometric verification successful!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (error) {
      console.error('🔐 Biometric verification failed:', error)
      if (error.name === 'NotAllowedError') {
        setError('Biometric verification was cancelled')
      } else if (error.name === 'InvalidStateError') {
        setError('Biometric authentication not set up. Please use email or SMS verification.')
        setMethod('email')
        sendVerificationCode('email')
      } else {
        setError('Biometric verification failed. Please try email verification.')
        setMethod('email')
        sendVerificationCode('email')
      }
    } finally {
      setLoading(false)
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
          method: method,
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
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setAttempts(prev => prev + 1)
        if (attempts >= 2) {
          setError('Too many failed attempts. Please request a new code.')
          setCodeSent(false)
          setVerificationCode('')
          setAttempts(0)
        } else {
          setError(`Invalid code. ${2 - attempts} attempts remaining.`)
        }
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
    setAttempts(0)
    setCodeSent(false)
    await sendVerificationCode(method)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Cancel</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">Please verify your identity to continue</p>
      </div>

      {/* Method Selector */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => {
            setMethod('email')
            setCodeSent(false)
            setVerificationCode('')
            setError('')
            sendVerificationCode('email')
          }}
          className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
            method === 'email' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Mail className="h-4 w-4 mx-auto mb-1" />
          <span className="text-sm">Email</span>
        </button>
        
        {userPhone && (
          <button
            onClick={() => {
              setMethod('sms')
              setCodeSent(false)
              setVerificationCode('')
              setError('')
              sendVerificationCode('sms')
            }}
            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
              method === 'sms' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="h-4 w-4 mx-auto mb-1" />
            <span className="text-sm">SMS</span>
          </button>
        )}
        
        {biometricSupported && (
          <button
            onClick={() => {
              setMethod('biometric')
              verifyBiometric()
            }}
            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
              method === 'biometric' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Fingerprint className="h-4 w-4 mx-auto mb-1" />
            <span className="text-sm">Biometric</span>
          </button>
        )}
      </div>

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

      {(method === 'email' || method === 'sms') && (
        <div className="space-y-6">
          <div className={`${method === 'email' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex items-center space-x-2 mb-2">
              {method === 'email' ? <Mail className="h-5 w-5 text-blue-600" /> : <Smartphone className="h-5 w-5 text-green-600" />}
              <span className={`font-medium ${method === 'email' ? 'text-blue-900' : 'text-green-900'}`}>
                {method === 'email' ? 'Email Verification' : 'SMS Verification'}
              </span>
            </div>
            <p className={`text-sm ${method === 'email' ? 'text-blue-800' : 'text-green-800'}`}>
              {codeSent 
                ? `Verification code sent to ${method === 'email' ? userEmail : userPhone}`
                : `We'll send a 6-digit code to ${method === 'email' ? userEmail : userPhone}`
              }
            </p>
            {codeSent && timeRemaining > 0 && (
              <div className="flex items-center space-x-1 mt-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  Code expires in {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {!codeSent ? (
            <button
              onClick={() => sendVerificationCode(method)}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                method === 'email' 
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  {method === 'email' ? <Mail className="h-4 w-4 mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
                  Send {method === 'email' ? 'Email' : 'SMS'} Code
                </>
              )}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
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

              <button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={resendCode}
                  disabled={loading || timeRemaining <= 0}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400"
                >
                  {timeRemaining <= 0 ? 'Code Expired - Click to Resend' : 'Resend Code'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {method === 'biometric' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <Fingerprint className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-purple-800 font-medium">
              {loading ? 'Waiting for biometric verification...' : 'Tap to verify with biometric authentication'}
            </p>
          </div>

          {!loading && (
            <button
              onClick={verifyBiometric}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Verify with Biometric
            </button>
          )}
        </div>
      )}
    </div>
  )
}