import React, { useState, useEffect, useRef } from 'react'
import { Shield, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Camera, Clock, Upload, User, Zap, Eye, RefreshCw, X } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface DiditKYCVerificationProps {
  onVerificationComplete: () => void
  onClose: () => void
}

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'active' | 'completed' | 'error'
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
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const steps: VerificationStep[] = [
    {
      id: 'upload',
      title: 'Upload ID',
      description: 'Government-issued photo ID',
      icon: Upload,
      status: 'pending'
    },
    {
      id: 'selfie',
      title: 'Take Selfie',
      description: 'Live photo with liveness detection',
      icon: Camera,
      status: 'pending'
    },
    {
      id: 'verify',
      title: 'Verification',
      description: 'Processing and approval',
      icon: CheckCircle,
      status: 'pending'
    }
  ]

  const [stepStatuses, setStepStatuses] = useState<VerificationStep[]>(steps)

  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('🚀 Starting verification for user:', user.id)
    setLoading(true)
    setError('')

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session - please sign in again')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const fullName = user.full_name || user.email.split('@')[0]
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || 'Name'

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Verification failed (${response.status})`)
      }

      const sessionData = await response.json()
      
      if (!sessionData.client_url) {
        throw new Error('No verification URL received')
      }

      setVerificationUrl(sessionData.client_url)
      setSessionId(sessionData.session_id)
      
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
    
    const maxPolls = 60 // 5 minutes max for real verification
    let pollInterval: NodeJS.Timeout
    
    const pollStatus = async () => {
      setPollCount(prev => {
        const newCount = prev + 1
        console.log(`🔄 Status poll #${newCount} for session:`, sessionId)
        return newCount
      })
      
      try {
        // First check Didit API directly for real-time status
        const { supabaseClient } = await import('../lib/supabase-client')
        const { data: { session } } = await supabaseClient.auth.getSession()
        
        if (!session) {
          throw new Error('Session expired')
        }

        // Call our backend to check Didit status
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
        
        const statusResponse = await fetch(`${supabaseUrl}/functions/v1/check-didit-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: user.id
          })
        })

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json()
          console.log('📊 Didit status check result:', statusResult)
          
          if (statusResult.status === 'approved' || statusResult.status === 'verified') {
            console.log('✅ Verification approved!')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setIsVerified(true)
            
            setTimeout(() => {
              onVerificationComplete()
            }, 2000)
            return
          } else if (statusResult.status === 'rejected' || statusResult.status === 'failed') {
            console.log('❌ Verification rejected')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Identity verification was rejected. Please contact support or try again with different documents.')
            return
          } else if (statusResult.status === 'expired') {
            console.log('⏰ Verification expired')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Verification session expired. Please start a new verification.')
            return
          }
        }
        
        // Also check our database for any updates
        const { data: complianceData } = await supabaseClient
          .from('compliance_records')
          .select('status, updated_at')
          .eq('verification_id', sessionId)
          .eq('verification_type', 'identity')
          .order('updated_at', { ascending: false })
          .limit(1)

        if (complianceData?.[0]) {
          const record = complianceData[0]
          console.log('📊 Database compliance record status:', record.status)
          
          if (record.status === 'approved') {
            console.log('✅ Database shows verification approved!')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setIsVerified(true)
            
            setTimeout(() => {
              onVerificationComplete()
            }, 2000)
            return
          }
        }
        
        if (pollCount >= maxPolls) {
          console.log('⏰ Status polling timeout after', pollCount, 'attempts')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification is taking longer than expected. Please complete the verification in the interface above, then click "Check Status" again.')
        }
        
      } catch (error) {
        console.error(`❌ Status polling error (attempt ${pollCount}):`, error)
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification status check failed. Please complete the verification and try checking status again.')
        }
      }
    }
    
    pollStatus()
    pollInterval = setInterval(pollStatus, 10000) // Check every 10 seconds

    return () => {
      clearInterval(pollInterval)
      setCheckingStatus(false)
    }
  }

  // Handle iframe messages to detect when verification is actually submitted
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Didit domain
      if (!event.origin.includes('didit.me')) return
      
      console.log('📨 Received message from Didit iframe:', event.data)
      
      // Look for verification completion signals
      if (event.data.type === 'verification_complete' || 
          event.data.type === 'verification_submitted' ||
          (typeof event.data === 'string' && event.data.includes('complete'))) {
        console.log('✅ Verification submitted by user!')
        setVerificationSubmitted(true)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Prevent infinite loading with timeout
  useEffect(() => {
    if (verificationUrl && !iframeLoaded) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Iframe loading timeout - forcing loaded state')
        setIframeLoaded(true)
      }, 10000)
      
      return () => clearTimeout(timeout)
    }
  }, [verificationUrl, iframeLoaded])

  // If user is verified, show success state
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Celebration Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                    animation: `confetti ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-green-900 mb-4">
            🎉 Identity Verified!
          </h1>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6">
            Congratulations! Your identity has been successfully verified.
          </h2>
          
          <div className="bg-white rounded-2xl p-8 border border-green-200 mb-8 shadow-lg">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Verification Complete</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Your identity documents have been reviewed and approved. You can now proceed to fund your investment account.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Identity Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Documents Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Account Activated</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onVerificationComplete}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-4"
          >
            <CheckCircle className="h-8 w-8" />
            Continue to Portfolio Funding
            <ArrowRight className="h-6 w-6" />
          </button>
          
          <p className="text-sm text-gray-500 mt-6">
            Your verification is complete and your account is now fully activated
          </p>
        </div>
        
        <style jsx>{`
          @keyframes confetti {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Secure Identity Verification
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Complete your identity verification to unlock funding capabilities. This secure process 
          helps us meet regulatory requirements and protect your account.
        </p>
      </div>

      {/* Progress Steps - Static Display */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Upload ID</h4>
            <p className="text-sm text-gray-600">Government-issued photo ID</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Take Selfie</h4>
            <p className="text-sm text-gray-600">Live photo with liveness detection</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Instant Approval</h4>
            <p className="text-sm text-gray-600">Automated verification</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
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
              setVerificationSubmitted(false)
              setStepStatuses(steps)
              setIframeLoaded(false)
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Main Content */}
      {!verificationUrl ? (
        <div className="text-center space-y-8">
          {/* Security Features */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
              <h4 className="text-2xl font-bold text-blue-900">Bank-Level Security</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">256-bit encryption for all data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Documents processed securely and encrypted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">No data stored on our servers</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">One-time verification process</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Full KYC/AML compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800">Instant approval in most cases</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startVerification}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                Initializing Secure Verification...
              </>
            ) : (
              <>
                <Shield className="w-8 h-8" />
                Begin Identity Verification
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500">
            Secure verification powered by advanced identity technology
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verification Interface */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Global Markets Consulting</span>
                    <div className="text-sm text-gray-600">Secure Identity Verification</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">SECURE</span>
                </div>
              </div>
            </div>
            
            {/* Loading Overlay */}
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Loading Verification Interface</h4>
                  <p className="text-gray-600">Initializing secure connection...</p>
                </div>
              </div>
            )}
            
            <div className="relative">
              <iframe
                ref={iframeRef}
                src={verificationUrl}
                title="Identity Verification"
                className="w-full h-[700px] border-none"
                allow="camera; microphone"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => {
                  console.log('✅ Verification iframe loaded successfully')
                  setIframeLoaded(true)
                }}
                onError={() => {
                  console.error('❌ Verification iframe failed to load')
                  setError('Failed to load verification interface. Please try again.')
                }}
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              />
              
              {/* Custom overlay to hide Didit branding */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Manual Status Check - Only show after user indicates completion */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Completed Your Verification?</h4>
              <p className="text-blue-800 mb-6">
                After you've uploaded your ID and taken your selfie in the verification interface above, 
                click the button below to check if your verification has been approved.
              </p>
              
              {!checkingStatus ? (
                <button
                  onClick={checkVerificationStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  Check My Verification Status
                </button>
              ) : (
                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="text-xl font-semibold text-blue-900">
                      Checking Verification Status...
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-blue-700 mb-2">
                      <strong>Status Check #{pollCount}</strong>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((pollCount / 60) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-blue-700 mb-4">
                    We're checking with our verification partner for your approval status. 
                    This process typically takes 1-3 minutes for real identity verification.
                  </p>
                  
                  <div className="text-sm text-blue-600 mb-4">
                    ⏱️ Real-time verification in progress... Please wait while we confirm your identity documents.
                  </div>
                  
                  <button
                    onClick={() => {
                      setCheckingStatus(false)
                      setPollCount(0)
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Cancel Status Check
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Accepted ID Types:</h5>
                <ul className="space-y-1">
                  <li>• Driver's License</li>
                  <li>• Passport</li>
                  <li>• National ID Card</li>
                  <li>• State ID Card</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Photo Tips:</h5>
                <ul className="space-y-1">
                  <li>• Ensure good lighting</li>
                  <li>• Keep ID flat and visible</li>
                  <li>• Look directly at camera for selfie</li>
                  <li>• Remove glasses if possible</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Verification Process:</h5>
                <ul className="space-y-1">
                  <li>• Upload clear photo of government ID</li>
                  <li>• Take live selfie for identity matching</li>
                  <li>• Wait for automated approval (1-3 minutes)</li>
                  <li>• Click "Check Status" when complete</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">What Happens Next:</h5>
                <ul className="space-y-1">
                  <li>• Real-time identity verification</li>
                  <li>• Automated approval system</li>
                  <li>• Immediate account activation</li>
                  <li>• Access to portfolio funding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Onboarding
        </button>
      </div>
    </div>
  )
}