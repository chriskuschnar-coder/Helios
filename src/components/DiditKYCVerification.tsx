import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Camera, Clock } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface DiditKYCVerificationProps {
  onVerificationComplete: () => void
  onClose: () => void
}

export function DiditKYCVerification({ onVerificationComplete, onClose }: DiditKYCVerificationProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [verificationStarted, setVerificationStarted] = useState(false)

  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('🚀 Starting Didit verification for user:', user.id)
    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session - please sign in again')
      }

      console.log('✅ User session found, creating Didit session...')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Extract user name from metadata or email
      const fullName = user.full_name || user.email.split('@')[0]
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || 'Name'

      console.log('📡 Calling Didit create session API...')

      const response = await fetch(`${supabaseUrl}/functions/v1/didit-create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          return_url: `${window.location.origin}/kyc/callback`
        })
      })

      console.log('📊 Didit API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Didit session creation failed:', errorData)
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please sign in again')
        } else if (response.status === 400) {
          throw new Error('Invalid verification request - please contact support')
        } else if (response.status >= 500) {
          throw new Error('Verification service temporarily unavailable - please try again')
        } else {
          throw new Error(errorData.error || `Verification failed (${response.status})`)
        }
      }

      const sessionData = await response.json()
      console.log('✅ Didit session created successfully:', {
        session_id: sessionData.session_id,
        has_client_url: !!sessionData.client_url
      })

      if (!sessionData.client_url) {
        throw new Error('No verification URL received from Didit')
      }

      setVerificationUrl(sessionData.client_url)
      setSessionId(sessionData.session_id)
      setVerificationStarted(true)
      
    } catch (error) {
      console.error('❌ Verification start failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const checkVerificationStatus = async () => {
    if (!sessionId || !user) {
      setError('No verification session found')
      return
    }

    console.log('🔍 Checking verification status for session:', sessionId)
    setCheckingStatus(true)
    setPollCount(0)
    
    const maxPolls = 60 // 5 minutes max (every 5 seconds)
    let pollInterval: NodeJS.Timeout
    
    const pollStatus = async () => {
      setPollCount(prev => {
        const newCount = prev + 1
        console.log(`🔄 Status poll #${newCount} for session:`, sessionId)
        return newCount
      })
      
      try {
        const { supabaseClient } = await import('../lib/supabase-client')
        
        // Check compliance records for verification result
        const { data: complianceData, error: complianceError } = await supabaseClient
          .from('compliance_records')
          .select('status, updated_at')
          .eq('verification_id', sessionId)
          .eq('verification_type', 'identity')
          .order('updated_at', { ascending: false })
          .limit(1)

        console.log('📊 Compliance check result:', { complianceData, complianceError })
        
        if (!complianceError && complianceData?.[0]) {
          const record = complianceData[0]
          console.log('📊 Found compliance record with status:', record.status)
          
          if (record.status === 'approved') {
            console.log('✅ Verification approved!')
            
            // Check if user KYC status was updated
            const { data: userData, error: userError } = await supabaseClient
              .from('users')
              .select('kyc_status')
              .eq('id', user.id)
              .single()

            if (!userError && userData?.kyc_status === 'verified') {
              console.log('✅ User KYC status confirmed as verified')
              clearInterval(pollInterval)
              setCheckingStatus(false)
              setIsVerified(true)
              
              setTimeout(() => {
                onVerificationComplete()
              }, 1500)
              return
            }
          } else if (record.status === 'rejected') {
            console.log('❌ Verification rejected')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Identity verification was rejected. Please contact support or try again.')
            return
          } else if (record.status === 'expired') {
            console.log('⏰ Verification expired')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Verification session expired. Please start a new verification.')
            return
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          console.log('⏰ Status polling timeout after', pollCount, 'attempts (5 minutes)')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification is taking longer than expected. Please contact support if you completed the verification.')
        }
        
      } catch (error) {
        console.error(`❌ Status polling error (attempt ${pollCount}):`, error)
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification status check failed. Please try again or contact support.')
        }
      }
    }
    
    // Start polling immediately, then every 5 seconds
    pollStatus()
    pollInterval = setInterval(pollStatus, 5000)

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up status polling')
      clearInterval(pollInterval)
      setCheckingStatus(false)
    }
  }

  // If user is verified, show success state
  if (isVerified) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          Identity Verified!
        </h3>
        <p className="text-gray-600 mb-6">
          Your identity has been successfully verified. You can now proceed to fund your account.
        </p>
        <button
          onClick={onVerificationComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3"
        >
          Continue to Funding
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Identity Verification Required
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          For compliance and security, all investors must complete a one-time identity verification 
          before contributing capital. This process takes 2-5 minutes and helps us meet regulatory requirements.
        </p>
      </div>

      {/* Verification Process Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Upload ID</h4>
          <p className="text-sm text-gray-600">
            Government-issued ID (passport, driver's license, or national ID)
          </p>
        </div>
        
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Take Selfie</h4>
          <p className="text-sm text-gray-600">
            Live selfie with liveness detection for identity confirmation
          </p>
        </div>
        
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Instant Approval</h4>
          <p className="text-sm text-gray-600">
            Automated verification with immediate approval in most cases
          </p>
        </div>
      </div>

      {/* Security & Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Security & Privacy</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Your documents are processed securely and encrypted</li>
          <li>• We use Didit, a trusted third-party verification provider</li>
          <li>• Your personal information is not stored on our servers</li>
          <li>• This is a one-time verification - you won't need to repeat it</li>
          <li>• The process is fully compliant with KYC/AML regulations</li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Verification Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError('')
              setVerificationUrl(null)
              setSessionId(null)
              setVerificationStarted(false)
            }}
            className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Status Checking Display - Only shown after verification started */}
      {checkingStatus && verificationStarted && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h4 className="font-semibold text-blue-900">Checking Verification Status</h4>
              <p className="text-sm text-blue-800">
                Waiting for verification results... (Poll #{pollCount})
              </p>
              <div className="mt-2 text-xs text-blue-600">
                This process can take 1-5 minutes depending on verification complexity.
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <button
              onClick={() => {
                setCheckingStatus(false)
                setPollCount(0)
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Stop Checking Status
            </button>
          </div>
        </div>
      )}

      {/* Verification Interface */}
      {!verificationUrl ? (
        <div className="text-center space-y-6">
          <button
            onClick={startVerification}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Creating Verification Session...
              </>
            ) : (
              <>
                <Shield className="w-6 h-6" />
                Start Identity Verification
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Powered by Didit • Secure identity verification
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-green-900">Verification Session Active</h4>
            </div>
            <p className="text-sm text-green-800 mb-4">
              Complete your identity verification in the secure frame below. 
              Upload your ID and take a selfie to complete the process.
            </p>
            <div className="text-sm text-green-700">
              <strong>Session ID:</strong> {sessionId}
            </div>
          </div>

          {/* Embedded Didit Verification */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Secure Identity Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">SECURE</span>
                </div>
              </div>
            </div>
            
            <iframe
              src={verificationUrl}
              title="Didit Identity Verification"
              className="w-full h-[600px] border-none"
              allow="camera; microphone"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => console.log('✅ Didit iframe loaded successfully')}
              onError={() => console.error('❌ Didit iframe failed to load')}
            />
          </div>

          {/* Check Status Button - Only available after verification started */}
          {verificationStarted && !checkingStatus && (
            <div className="text-center">
              <button
                onClick={checkVerificationStatus}
                className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Check Verification Status
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Click this button after completing the verification above
              </p>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          ← Back to Portfolio
        </button>
      </div>
    </div>
  )
}