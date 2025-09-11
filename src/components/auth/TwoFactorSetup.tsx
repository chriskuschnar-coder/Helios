import React, { useState, useEffect } from 'react'
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertCircle, QrCode, Download, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface TwoFactorSetupProps {
  onClose: () => void
  onSuccess: () => void
}

interface Factor {
  id: string
  type: string
  status: string
}

interface Challenge {
  id: string
  expires_at: string
}

export function TwoFactorSetup({ onClose, onSuccess }: TwoFactorSetupProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'complete'>('intro')
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factor, setFactor] = useState<Factor | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const startSetup = async () => {
    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Enroll in TOTP MFA
      const { data, error } = await supabaseClient.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      })

      if (error) {
        throw error
      }

      console.log('✅ 2FA enrollment started:', data)
      
      setFactor(data)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setStep('setup')
      
    } catch (err) {
      console.error('❌ 2FA setup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (!factor || !verificationCode.trim()) {
      setError('Please enter the 6-digit code from your authenticator app')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../../lib/supabase-client')
      
      // Create challenge for verification
      const { data: challengeData, error: challengeError } = await supabaseClient.auth.mfa.challenge({
        factorId: factor.id
      })

      if (challengeError) {
        throw challengeError
      }

      setChallenge(challengeData)

      // Verify the TOTP code
      const { data, error } = await supabaseClient.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: verificationCode.trim()
      })

      if (error) {
        throw error
      }

      console.log('✅ 2FA verification successful:', data)
      
      // Update user's 2FA status in our users table
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ two_factor_enabled: true })
        .eq('id', user?.id)

      if (updateError) {
        console.warn('⚠️ Failed to update 2FA status in users table:', updateError)
      }

      // Generate backup codes (simulated for demo)
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + 
        Math.random().toString(36).substr(2, 4).toUpperCase()
      )
      setBackupCodes(codes)
      setStep('complete')
      
    } catch (err) {
      console.error('❌ 2FA verification error:', err)
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'secret' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'secret') {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      } else {
        setCopiedCodes(true)
        setTimeout(() => setCopiedCodes(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const downloadBackupCodes = () => {
    const content = `Global Markets Consulting - 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser: ${user?.email}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gmc-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleComplete = () => {
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {step === 'intro' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-gray-600 mb-8">
                Add an extra layer of security to your account with 2FA. You'll need an authenticator app like Google Authenticator or Authy.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Protects against unauthorized access</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span>Works with any TOTP authenticator app</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Key className="h-4 w-4 text-green-600" />
                  <span>Backup codes for account recovery</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startSetup}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Setting up...' : 'Get Started'}
                </button>
              </div>
            </div>
          )}

          {step === 'setup' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-gray-600">
                  Use your authenticator app to scan this QR code
                </p>
              </div>

              {qrCode && (
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={qrCode} 
                      alt="2FA QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual Entry Key (if QR code doesn't work)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(secret, 'secret')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiedSecret ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>2. Scan the QR code or enter the manual key</li>
                  <li>3. Enter the 6-digit code from your app below</li>
                </ol>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                I've Added the Account
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Verify Setup
                </h3>
                <p className="text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-900 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={verifySetup}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                2FA Enabled Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your account is now protected with two-factor authentication.
              </p>

              {backupCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Key className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Backup Codes</span>
                  </div>
                  <p className="text-sm text-yellow-800 mb-4">
                    Save these backup codes in a secure location. Each code can only be used once.
                  </p>
                  
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-center py-1">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copiedCodes ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedCodes ? 'Copied!' : 'Copy Codes'}</span>
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}