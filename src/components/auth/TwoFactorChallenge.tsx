import React, { useState, useEffect } from 'react'
import { Shield, Mail, Fingerprint, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Copy } from 'lucide-react'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
  biometricEnabled?: boolean
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail,
  biometricEnabled = false 
}) => {
  const [method, setMethod] = useState<'email' | 'biometric'>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [biometricSupported, setBiometricSupported] = useState(false)

  useEffect(() => {
    checkBiometricSupport()
    // Auto-send email code when component mounts
    if (method === 'email') {
      sendEmailCode()
    }
  }, [])

  const checkBiometricSupport = async () => {
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricSupported(available && biometricEnabled)
      }
    } catch (error) {
      setBiometricSupported(false)
    }
  }

  const sendEmailCode = async () => {
    setLoading(true)
    setError('')

    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setSentCode(code)

      console.log('📧 2FA Challenge code sent to', userEmail, ':', code)
      
      // Simulate email send delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(`Verification code sent to ${userEmail}`)
    } catch (error) {
      setError('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const verifyBiometric = async () => {
    setLoading(true)
    setError('')

    try {
      // Get stored credential ID
      const credentialId = localStorage.getItem('biometric_credential_id')
      if (!credentialId) {
        throw new Error('No biometric credential found')
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
      } else {
        setError('Biometric verification failed. Please try email verification.')
        setMethod('email')
        sendEmailCode()
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (verificationCode === sentCode) {
        setSuccess('Verification successful!')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setAttempts(prev => prev + 1)
        if (attempts >= 2) {
          setError('Too many failed attempts. Please request a new code.')
          setSentCode('')
          setVerificationCode('')
          setAttempts(0)
        } else {
          setError(`Invalid code. ${2 - attempts} attempts remaining.`)
        }
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setVerificationCode('')
    setAttempts(0)
    await sendEmailCode()
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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication Required</h2>
        <p className="text-gray-600">Please verify your identity to continue</p>
      </div>

      {/* Method Selector */}
      {biometricSupported && (
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
              method === 'email' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mail className="h-4 w-4 mx-auto mb-1" />
            <span className="text-sm">Email</span>
          </button>
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

      {method === 'email' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              We've sent a 6-digit verification code to <strong>{userEmail}</strong>
            </p>
          </div>

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
            onClick={verifyEmailCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={resendCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Resend Code
            </button>
          </div>

          {/* Demo code display */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Demo Mode</span>
            </div>
            <p className="text-xs text-yellow-800 mb-2">
              For testing, your verification code is:
            </p>
            <div className="flex items-center space-x-2">
              <code className="bg-white px-3 py-1 rounded border text-lg font-mono font-bold text-yellow-900">
                {sentCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sentCode)
                  setSuccess('Code copied!')
                  setTimeout(() => setSuccess(''), 2000)
                }}
                className="p-1 hover:bg-yellow-100 rounded"
              >
                <Copy className="h-4 w-4 text-yellow-600" />
              </button>
            </div>
          </div>
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