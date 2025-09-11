import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, X, ArrowRight, RefreshCw, Shield, FileText, Eye, Loader2, Bell, TrendingUp } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

interface KYCVerificationInProgressProps {
  onContinueBrowsing: () => void
  onFundPortfolio?: () => void
  onResubmitKYC?: () => void
}

export function KYCVerificationInProgress({ 
  onContinueBrowsing, 
  onFundPortfolio, 
  onResubmitKYC 
}: KYCVerificationInProgressProps) {
  const { user, refreshProfile } = useAuth()
  const [kycStatus, setKycStatus] = useState(user?.kyc_status || 'pending')
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [checkCount, setCheckCount] = useState(0)
  const [showStatusBanner, setShowStatusBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')
  const [autoPolling, setAutoPolling] = useState(true)
  const [verificationProgress, setVerificationProgress] = useState(0)

  // Enhanced KYC status checking with better error handling
  const checkKYCStatus = async (isManualCheck = false) => {
    if (!user?.id) return

    setLoading(true)
    setCheckCount(prev => prev + 1)
    
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        console.warn('No session found during KYC status check')
        return
      }

      // STEP 1: Check our database for current status
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('kyc_status, kyc_verified_at, updated_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to check KYC status:', error)
        return
      }

      console.log('📊 KYC Status Check:', {
        current: kycStatus,
        database: userData.kyc_status,
        checkCount,
        isManual: isManualCheck
      })

      // STEP 2: If status changed, update UI and show notification
      if (userData.kyc_status !== kycStatus) {
        console.log('🔄 KYC Status Changed:', kycStatus, '→', userData.kyc_status)
        setKycStatus(userData.kyc_status)
        
        // Show appropriate banner message
        if (userData.kyc_status === 'verified') {
          setBannerMessage('🎉 Your identity has been verified! You can now fund your portfolio.')
          setShowStatusBanner(true)
          setAutoPolling(false) // Stop polling once verified
          
          // Refresh user profile to get latest data
          await refreshProfile()
          
          // Auto-hide banner after 15 seconds
          setTimeout(() => setShowStatusBanner(false), 15000)
        } else if (userData.kyc_status === 'rejected') {
          setBannerMessage('❌ Verification failed. Please resubmit your documents.')
          setShowStatusBanner(true)
          setAutoPolling(false) // Stop polling on rejection
          
          // Auto-hide banner after 20 seconds
          setTimeout(() => setShowStatusBanner(false), 20000)
        }
      }

      // STEP 3: For manual checks, also check Didit API directly
      if (isManualCheck) {
        console.log('🔍 Manual check - querying Didit API...')
        
        // Get the latest compliance record for this user
        const { data: complianceData } = await supabaseClient
          .from('compliance_records')
          .select('verification_id, status')
          .eq('user_id', user.id)
          .eq('verification_type', 'identity')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (complianceData?.verification_id) {
          try {
            // Call our check-didit-status function
            const statusResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-didit-status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              },
              body: JSON.stringify({
                session_id: complianceData.verification_id,
                user_id: user.id
              })
            })

            if (statusResponse.ok) {
              const statusResult = await statusResponse.json()
              console.log('📊 Didit API status check result:', statusResult)
              
              if (statusResult.is_approved && userData.kyc_status !== 'verified') {
                console.log('🎉 Didit API shows approved - status will update shortly')
                setBannerMessage('✅ Verification approved! Updating your account...')
                setShowStatusBanner(true)
                
                // Trigger another database check in 2 seconds
                setTimeout(() => checkKYCStatus(false), 2000)
              }
            }
          } catch (apiError) {
            console.warn('⚠️ Didit API check failed:', apiError)
          }
        }
      }
      
      setLastChecked(new Date())
    } catch (error) {
      console.error('KYC status check error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up automatic polling every 30 seconds
  useEffect(() => {
    if (!autoPolling) return

    checkKYCStatus()
    
    const interval = setInterval(() => {
      if (autoPolling && kycStatus === 'pending') {
        checkKYCStatus()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user?.id, kycStatus, autoPolling])

  // Set up Supabase real-time subscription for instant updates
  useEffect(() => {
    if (!user?.id) return

    const setupRealtimeSubscription = async () => {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      console.log('🔔 Setting up real-time KYC status subscription...')
      
      const subscription = supabaseClient
        .channel('kyc-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Real-time KYC status update received:', payload.new.kyc_status)
            
            if (payload.new.kyc_status !== kycStatus) {
              setKycStatus(payload.new.kyc_status)
              
              if (payload.new.kyc_status === 'verified') {
                setBannerMessage('🎉 Your identity has been verified! You can now fund your portfolio.')
                setShowStatusBanner(true)
                setAutoPolling(false)
                refreshProfile()
                setTimeout(() => setShowStatusBanner(false), 15000)
              } else if (payload.new.kyc_status === 'rejected') {
                setBannerMessage('❌ Verification failed. Please resubmit your documents.')
                setShowStatusBanner(true)
                setAutoPolling(false)
                setTimeout(() => setShowStatusBanner(false), 20000)
              }
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }

    setupRealtimeSubscription()
  }, [user?.id, kycStatus])

  // Progress bar animation
  useEffect(() => {
    if (kycStatus === 'pending') {
      const interval = setInterval(() => {
        setVerificationProgress(prev => {
          if (prev >= 90) return 20 // Reset to 20% to show ongoing process
          return prev + Math.random() * 5 + 2 // Increment by 2-7%
        })
      }, 3000)
      
      return () => clearInterval(interval)
    } else {
      setVerificationProgress(100)
    }
  }, [kycStatus])

  const getStatusDisplay = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: '✅ Identity Verified!',
          message: 'Your identity has been successfully verified. You can now fund your portfolio and access all features.',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          actionButton: (
            <button
              onClick={onFundPortfolio}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <TrendingUp className="h-6 w-6" />
              Fund Portfolio Now
              <ArrowRight className="h-5 w-5" />
            </button>
          )
        }
      
      case 'rejected':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-600" />,
          title: '❌ Verification Failed',
          message: 'Your verification could not be approved. This may be due to document quality, information mismatch, or other verification requirements. Please resubmit your documents.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          actionButton: (
            <button
              onClick={onResubmitKYC}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <RefreshCw className="h-6 w-6" />
              Resubmit Documents
              <ArrowRight className="h-5 w-5" />
            </button>
          )
        }
      
      default: // pending
        return {
          icon: <Clock className="h-16 w-16 text-blue-600 animate-pulse" />,
          title: '🕒 Identity Verification in Progress',
          message: 'Your identity verification is being processed. This usually takes a few minutes. You will be notified once your identity is approved.',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          actionButton: (
            <button
              onClick={onContinueBrowsing}
              className="bg-navy-600 hover:bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <Eye className="h-6 w-6" />
              Continue Browsing Portal
              <ArrowRight className="h-5 w-5" />
            </button>
          )
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      {/* Status Change Banner */}
      {showStatusBanner && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-500">
          <div className={`${
            kycStatus === 'verified' ? 'bg-green-600' : 'bg-red-600'
          } text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
            {kycStatus === 'verified' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{bannerMessage}</span>
            <button
              onClick={() => setShowStatusBanner(false)}
              className={`${kycStatus === 'verified' ? 'text-green-200 hover:text-white' : 'text-red-200 hover:text-white'} transition-colors`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full">
        {/* Close Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onContinueBrowsing}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            title="Continue browsing portal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Status Card */}
        <div className={`bg-white rounded-2xl shadow-xl border-2 ${statusDisplay.borderColor} overflow-hidden`}>
          {/* Header */}
          <div className={`${statusDisplay.bgColor} p-6 border-b ${statusDisplay.borderColor}`}>
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                {statusDisplay.icon}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {statusDisplay.title}
              </h1>
              
              <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                {statusDisplay.message}
              </p>
            </div>
          </div>

          {/* Progress Section (only for pending) */}
          {kycStatus === 'pending' && (
            <div className="p-6 border-b border-gray-100">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Verification Progress</span>
                  <span className="text-sm text-gray-500">{verificationProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Real-time verification in progress...</span>
                </div>
                <p>Our system is automatically checking your verification status every 30 seconds</p>
              </div>
            </div>
          )}

          {/* Status Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Current Status</div>
                <div className={`font-semibold capitalize ${
                  kycStatus === 'verified' ? 'text-green-600' :
                  kycStatus === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {kycStatus === 'verified' ? 'Verified ✅' : 
                   kycStatus === 'rejected' ? 'Rejected ❌' : 
                   'Processing 🕒'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Last Checked</div>
                <div className="font-semibold text-gray-900">
                  {lastChecked.toLocaleTimeString()}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Status Checks</div>
                <div className="font-semibold text-gray-900">
                  #{checkCount}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center mb-6">
              {statusDisplay.actionButton}
            </div>

            {/* Manual Check and Auto-polling Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => checkKYCStatus(true)}
                  disabled={loading}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Check Status Now</span>
                </button>
                
                {kycStatus === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoPolling"
                      checked={autoPolling}
                      onChange={(e) => setAutoPolling(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoPolling" className="text-sm text-gray-600">
                      Auto-check every 30 seconds
                    </label>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-gray-500">
                {autoPolling && kycStatus === 'pending' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Automatic status checking enabled</span>
                  </div>
                ) : (
                  <span>Manual status checking only</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* What You Can Do While Waiting (only for pending) */}
        {kycStatus === 'pending' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              What You Can Do While Waiting
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Browse portfolio interface (read-only)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Review investment documents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Explore security settings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-blue-800">Learn about our strategies</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">
                  You'll be automatically notified when verification completes - no need to refresh!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Tips (only for pending) */}
        {kycStatus === 'pending' && (
          <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Verification Process</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">What We're Checking:</h5>
                <ul className="space-y-1">
                  <li>• Document authenticity</li>
                  <li>• Identity verification</li>
                  <li>• Photo matching</li>
                  <li>• Information validation</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Typical Timeline:</h5>
                <ul className="space-y-1">
                  <li>• Instant: Document upload</li>
                  <li>• 1-5 minutes: Automated checks</li>
                  <li>• 5-15 minutes: Manual review (if needed)</li>
                  <li>• Immediate: Account unlock</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about verification?{' '}
            <a 
              href="mailto:support@globalmarketsconsulting.com" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}