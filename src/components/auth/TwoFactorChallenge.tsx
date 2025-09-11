import React, { useState } from 'react'
import { Shield, ArrowLeft, AlertCircle, CheckCircle, Key, Smartphone } from 'lucide-react'
import { supabaseClient } from '../../lib/supabase-client'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onBack: () => void
  factorId: string
  challengeId: string
}

export function TwoFactorChallenge({ onSuccess, onBack, factorId, challengeId }: TwoFactorChallengeProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Verifying 2FA code...')
      
      const { data, error } = await supabaseClient.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeId,
        code: code.trim()
      })

      if (error) {
        throw error
      }

      console.log('✅ 2FA verification successful')
      onSuccess()
      
    } catch (err) {
      console.error('❌ 2FA verification failed:', err)
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Open your authenticator app and enter the 6-digit code
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="flex-1 bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Smartphone className="h-4 w-4" />
          <span>Use Google Authenticator, Authy, or similar app</span>
        </div>
      </div>
    </div>
  )
}