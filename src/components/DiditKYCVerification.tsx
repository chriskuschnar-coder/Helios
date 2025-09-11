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
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [showTimeoutOptions, setShowTimeoutOptions] = useState(false)
  const [manualOverride, setManualOverride] = useState(false)

  // Check KYC status on component mount
  useEffect(() => {
    if (user) {
      checkKYCStatus()
    }
    
    // Cleanup on unmount
    return () => {
      setCheckingStatus(false)
      setShowTimeoutOptions(false)
    }
  }, [user])

  const checkKYCStatus = async () => {
    if (!user) return
    
    setCheckingStatus(true)
    console.log('🔍 Starting KYC status check for user:', user.id)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        console.warn('❌ No active session for KYC check')
        setCheckingStatus(false)
        setError('Please sign in again to check verification status')
        return
      }

      console.log('✅ Session found, checking KYC status...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Add timeout to prevent infinite loading
      // Check user's KYC status directly from users table
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('kyc_status')
        .eq('id', user.id)
        .single()

      console.log('📊 Direct user KYC check:', { userData, userError })

      if (!userError && userData) {
        const kycStatusData = {
          user_id: user.id,
          kyc_status: userData.kyc_status || 'pending',
          is_verified: userData.kyc_status === 'verified',
          can_fund: userData.kyc_status === 'verified',
          message: userData.kyc_status === 'verified' 
            ? 'User is verified and can fund their account'
            : 'Identity verification required before funding'
        }
        
        setKycStatus(kycStatusData)
        
        if (kycStatusData.is_verified) {
          console.log('🎉 User is already verified!')
          setIsVerified(true)
          // Auto-proceed after short delay
          setTimeout(() => {
            onVerificationComplete()
          }, 1500)
        }
      } else {
        console.warn('⚠️ Could not check user KYC status:', userError)
        // Don't throw error, just continue with verification flow
      }
    } catch (error) {
      console.error('❌ KYC status check error:', error)
      // Don't show error, just continue with verification flow
      console.log('ℹ️ Continuing with verification flow due to status check error')
    } finally {
      setCheckingStatus(false)
    }
  }

  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('🚀 Starting Didit verification for user:', user.id)
    setLoading(true)
    setError('')
    setCheckingStatus(false)

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

      // Create verification session with timeout
      const createSessionPromise = fetch(`${supabaseUrl}/functions/v1/didit-create-session`, {
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

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          console.error('⏰ Didit session creation timeout after 10 seconds')
          reject(new Error('Verification session creation timeout - please try again'))
        }, 10000)
        return timeoutId
      })

      const response = await Promise.race([createSessionPromise, timeoutPromise]) as Response

      console.log('📊 Didit API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Didit session creation failed:', errorData)
        
        // More specific error messages
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
      
      console.log('🔄 Starting status polling...')
      startStatusPolling(sessionData.session_id)
      
    } catch (error) {
      console.error('❌ Verification start failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const startStatusPolling = (sessionId: string) => {
    console.log('🔄 Starting status polling for session:', sessionId)
    setCheckingStatus(true)
    
    let pollCount = 0
    const maxPolls = 60 // 5 minutes max (every 5 seconds)
    let pollInterval: NodeJS.Timeout
    
    const pollStatus = async () => {
      pollCount++
      console.log(`🔄 Status poll #${pollCount} for session:`, sessionId)
      
      try {
        // OPTION 1: Check our compliance records first
        const { supabaseClient } = await import('../lib/supabase-client')
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
            
            // Update user KYC status and complete
            const { data: userData, error: userError } = await supabaseClient
              .from('users')
              .select('kyc_status')
              .eq('id', user?.id)
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
        } else {
          console.log('ℹ️ No compliance record found yet, continuing to poll...')
        }
        
        // OPTION 2: If no compliance record, check user KYC status directly
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('kyc_status')
          .eq('id', user?.id)
          .single()

        if (!userError && userData?.kyc_status === 'verified') {
          console.log('✅ User KYC status is verified (direct check)')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setIsVerified(true)
          
          setTimeout(() => {
            onVerificationComplete()
          }, 1500)
          return
        }
        
        // Stop polling after max attempts with user-friendly message
        if (pollCount >= maxPolls) {
          console.log('⏰ Status polling timeout after', pollCount, 'attempts (5 minutes)')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification is taking longer than expected. You can return to your dashboard and we\'ll email you when it\'s complete.')
          
          // Show "Return to Dashboard" option after timeout
          setTimeout(() => {
            setShowTimeoutOptions(true)
          }, 1000)
        }
        
      } catch (error) {
        console.error(`❌ Status polling error (attempt ${pollCount}):`, error)
        
        // Don't stop polling on individual errors unless we've hit max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Unable to check verification status. Please try again or contact support.')
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

  // If user is already verified, show success state
  if (isVerified || (kycStatus?.is_verified && !loading)) {
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

      {/* Current Status Display */}
      {kycStatus && !isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900">Current Status</h4>
          </div>
          <div className="text-sm text-yellow-800 space-y-2">
            <div className="flex justify-between">
              <span>KYC Status:</span>
              <span className="font-medium capitalize">{kycStatus.kyc_status}</span>
            </div>
            <div className="flex justify-between">
              <span>Can Fund Account:</span>
              <span className="font-medium">{kycStatus.can_fund ? 'Yes' : 'No'}</span>
            </div>
            <p className="mt-2 text-yellow-700">{kycStatus.message}</p>
          </div>
        </div>
      )}

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
            }}
            className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Status Checking Display */}
      {checkingStatus && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h4 className="font-semibold text-blue-900">Checking Verification Status</h4>
              <p className="text-sm text-blue-800">
                Please wait while we check your verification status... (Poll #{updateCount})
              </p>
              <div className="mt-2 text-xs text-blue-600">
                This usually takes 30-60 seconds. If it takes longer, you can return to your dashboard.
              </div>
            </div>
          </div>
          
          {/* Add manual override after 30 seconds */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <button
              onClick={() => {
                console.log('👤 User manually proceeding to verification')
                setCheckingStatus(false)
                setError('')
                // Skip to verification start
                if (!verificationUrl) {
                  startVerification()
                }
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Skip Status Check & Start Verification →
            </button>
          </div>
        </div>
      )}
      
      {/* Timeout Options */}
      {showTimeoutOptions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900">Verification Taking Longer Than Expected</h4>
          </div>
          <p className="text-sm text-yellow-800 mb-4">
            Your verification is still processing. You have a few options:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                console.log('👤 User returning to dashboard')
                onClose()
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                console.log('🔄 User restarting live verification')
                setShowTimeoutOptions(false)
                setError('')
                setVerificationUrl(null)
                setSessionId(null)
                setKycStatus(null)
                startVerification()
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Restart Live Verification
            </button>
          </div>
        </div>
      )}

      {/* Verification Interface */}
      {!verificationUrl ? (
        <div className="text-center space-y-6">
          {/* Manual Override Option */}
          {!checkingStatus && !loading && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="font-semibold text-green-900">Skip Verification (Demo Mode)</h4>
              </div>
              <p className="text-sm text-green-800 mb-4">
                For testing purposes, you can skip identity verification and proceed directly to funding.
              </p>
              <button
                onClick={() => {
                  console.log('🎯 Demo mode: Skipping verification')
                  setLoading(true)
                  setIsVerified(true)
                  setTimeout(() => {
                    setLoading(false)
                    onVerificationComplete()
                  }, 1000)
                }}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Skip Verification (Demo)'}
              </button>
            </div>
          )}
          
          <button
            onClick={startVerification}
            disabled={loading || checkingStatus}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Creating Verification Session...
              </>
            ) : checkingStatus ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Checking Status...
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
              <h4 className="font-semibold text-green-900">Verification Session Created</h4>
            </div>
            <p className="text-sm text-green-800 mb-4">
              Complete your identity verification in the secure frame below. 
              The process typically takes 2-5 minutes.
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

          {checkingStatus && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
                <span className="font-medium text-yellow-900">Verification in Progress</span>
              </div>
              <p className="text-sm text-yellow-800">
                Please complete the verification process above. Your status will update automatically 
                when verification is complete. Do not close this window.
              </p>
              
              {/* Add timeout escape hatch */}
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <button
                  onClick={() => {
                    console.log('👤 User manually stopping status check')
                    setCheckingStatus(false)
                    setShowTimeoutOptions(true)
                  }}
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  Stop Checking & Show Options
                </button>
              </div>
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