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
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [idUploaded, setIdUploaded] = useState(false)
  const [selfieCompleted, setSelfieCompleted] = useState(false)
  const [showStatusCheck, setShowStatusCheck] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [currentStepDescription, setCurrentStepDescription] = useState('')

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
      title: 'Instant Approval',
      description: 'Automated verification',
      icon: CheckCircle,
      status: 'pending'
    }
  ]

  const [stepStatuses, setStepStatuses] = useState<VerificationStep[]>(steps)

  const updateStepStatus = (stepId: string, status: VerificationStep['status']) => {
    setStepStatuses(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    console.log('🚀 Starting custom embedded verification for user:', user.id)
    setLoading(true)
    setError('')
    setCurrentStep(0)
    updateStepStatus('upload', 'active')

    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session - please sign in again')
      }

      console.log('✅ User session found, creating Didit session...')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const fullName = user.full_name || user.email.split('@')[0]
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || 'Name'

      console.log('📡 Creating embedded verification session...')

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

      console.log('📊 Verification API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Verification session creation failed:', errorData)
        throw new Error(errorData.error || `Verification failed (${response.status})`)
      }

      const sessionData = await response.json()
      console.log('✅ Verification session created successfully:', {
        session_id: sessionData.session_id,
        has_client_url: !!sessionData.client_url
      })

      if (!sessionData.client_url) {
        throw new Error('No verification URL received')
      }

      setVerificationUrl(sessionData.client_url)
      setSessionId(sessionData.session_id)
      setVerificationStarted(true)
      setCurrentStepDescription('Upload your government-issued photo ID')
      
      // Start progress simulation
      simulateProgress()
      
    } catch (error) {
      console.error('❌ Verification start failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
      updateStepStatus('upload', 'error')
    } finally {
      setLoading(false)
    }
  }

  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // 5-20% increments
      
      if (progress >= 30 && !idUploaded) {
        setIdUploaded(true)
        updateStepStatus('upload', 'completed')
        updateStepStatus('selfie', 'active')
        setCurrentStep(1)
        setCurrentStepDescription('Take a live selfie for identity confirmation')
      }
      
      if (progress >= 70 && !selfieCompleted) {
        setSelfieCompleted(true)
        updateStepStatus('selfie', 'completed')
        updateStepStatus('verify', 'active')
        setCurrentStep(2)
        setCurrentStepDescription('Processing verification...')
      }
      
      if (progress >= 100) {
        clearInterval(interval)
        setShowStatusCheck(true)
        setCurrentStepDescription('Verification submitted - check status below')
      }
      
      setVerificationProgress(Math.min(progress, 100))
    }, 2000) // Update every 2 seconds
  }

  const checkVerificationStatus = async () => {
    if (!sessionId || !user) {
      setError('No verification session found')
      return
    }

    console.log('🔍 Checking verification status for session:', sessionId)
    setCheckingStatus(true)
    setPollCount(0)
    
    const maxPolls = 30 // 2.5 minutes max (every 5 seconds)
    let pollInterval: NodeJS.Timeout
    
    const pollStatus = async () => {
      setPollCount(prev => {
        const newCount = prev + 1
        console.log(`🔄 Status poll #${newCount} for session:`, sessionId)
        return newCount
      })
      
      try {
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
            updateStepStatus('verify', 'completed')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setIsVerified(true)
            
            setTimeout(() => {
              onVerificationComplete()
            }, 1500)
            return
          } else if (record.status === 'rejected') {
            console.log('❌ Verification rejected')
            updateStepStatus('verify', 'error')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Identity verification was rejected. Please contact support or try again.')
            return
          } else if (record.status === 'expired') {
            console.log('⏰ Verification expired')
            updateStepStatus('verify', 'error')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setError('Verification session expired. Please start a new verification.')
            return
          }
        }
        
        if (pollCount >= maxPolls) {
          console.log('⏰ Status polling timeout after', pollCount, 'attempts')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification is taking longer than expected. Please contact support.')
        }
        
      } catch (error) {
        console.error(`❌ Status polling error (attempt ${pollCount}):`, error)
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification status check failed. Please try again.')
        }
      }
    }
    
    pollStatus()
    pollInterval = setInterval(pollStatus, 5000)

    return () => {
      console.log('🧹 Cleaning up status polling')
      clearInterval(pollInterval)
      setCheckingStatus(false)
    }
  }

  // Handle iframe messages for better integration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://verification.didit.me') return
      
      console.log('📨 Received message from Didit iframe:', event.data)
      
      // Handle different verification events
      if (event.data.type === 'verification_step') {
        const { step, progress } = event.data
        
        if (step === 'id_uploaded') {
          setIdUploaded(true)
          updateStepStatus('upload', 'completed')
          updateStepStatus('selfie', 'active')
          setCurrentStep(1)
        } else if (step === 'selfie_completed') {
          setSelfieCompleted(true)
          updateStepStatus('selfie', 'completed')
          updateStepStatus('verify', 'active')
          setCurrentStep(2)
        } else if (step === 'verification_submitted') {
          setShowStatusCheck(true)
        }
        
        if (progress) {
          setVerificationProgress(progress)
        }
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
      }, 10000) // 10 second timeout
      
      return () => clearTimeout(timeout)
    }
  }, [verificationUrl, iframeLoaded])

  // If user is verified, show success state
  if (isVerified) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-green-900 mb-4">
          Identity Verified!
        </h3>
        <p className="text-lg text-gray-600 mb-8">
          Your identity has been successfully verified. You can now proceed to fund your account.
        </p>
        <button
          onClick={onVerificationComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 text-lg hover:scale-105 shadow-lg"
        >
          Continue to Funding
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Custom Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Secure Identity Verification
        </h3>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Complete your identity verification in just a few minutes. This secure process helps us 
          meet regulatory requirements and protect your account.
        </p>
      </div>

      {/* Custom Progress Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stepStatuses.map((step, index) => (
          <div 
            key={step.id}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
              step.status === 'completed' ? 'border-green-500 bg-green-50' :
              step.status === 'active' ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' :
              step.status === 'error' ? 'border-red-500 bg-red-50' :
              'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                step.status === 'completed' ? 'bg-green-500 text-white' :
                step.status === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                step.status === 'error' ? 'bg-red-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-8 w-8" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-8 w-8" />
                ) : step.status === 'active' ? (
                  <step.icon className="h-8 w-8 animate-bounce" />
                ) : (
                  <step.icon className="h-8 w-8" />
                )}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
              
              {step.status === 'active' && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${verificationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {verificationProgress.toFixed(0)}% Complete
                  </p>
                </div>
              )}
            </div>
            
            {/* Step connector line */}
            {index < stepStatuses.length - 1 && (
              <div className={`hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 transform -translate-y-1/2 transition-colors duration-500 ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
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
              setVerificationStarted(false)
              setShowStatusCheck(false)
              setStepStatuses(steps)
              setCurrentStep(0)
              setVerificationProgress(0)
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Custom Embedded Verification Interface */}
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
          {/* Current Step Indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Step {currentStep + 1} of 3</h4>
                  <p className="text-blue-100">{currentStepDescription}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{verificationProgress.toFixed(0)}%</div>
                <div className="text-blue-100 text-sm">Complete</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${verificationProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Custom Embedded Verification Frame */}
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
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Status Check Section - Only shown after verification progress */}
          {showStatusCheck && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">Verification Submitted!</h4>
                <p className="text-green-800 mb-6">
                  Your identity verification has been submitted for processing. 
                  Click below to check the status.
                </p>
                
                {!checkingStatus ? (
                  <button
                    onClick={checkVerificationStatus}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
                  >
                    <Clock className="h-5 w-5" />
                    Check Verification Status
                  </button>
                ) : (
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                      <span className="text-lg font-semibold text-green-900">
                        Checking Status... (Poll #{pollCount})
                      </span>
                    </div>
                    <p className="text-green-700 mb-4">
                      Waiting for verification results. This usually takes 30-60 seconds.
                    </p>
                    <button
                      onClick={() => {
                        setCheckingStatus(false)
                        setPollCount(0)
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Stop Checking
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-6">
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
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Portfolio
        </button>
      </div>
    </div>
  )
}