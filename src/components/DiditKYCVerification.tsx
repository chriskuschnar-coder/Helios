import React, { useState } from 'react'
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

  const startVerification = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🚀 Starting Didit v2 verification for user:', user.id)

      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Extract user name from metadata or email
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
        const errorData = await response.json()
        console.error('❌ Didit session creation failed:', errorData)
        throw new Error(errorData.error || 'Failed to create verification session')
      }

      const sessionData = await response.json()
      console.log('✅ Didit v2 session created:', sessionData)

      setVerificationUrl(sessionData.client_url)
      setSessionId(sessionData.session_id)
      
      // Start polling for verification completion
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
    
    const pollInterval = setInterval(async () => {
      try {
        // Check compliance records for verification status
        const { supabaseClient } = await import('../lib/supabase-client')
        const { data: complianceData, error: complianceError } = await supabaseClient
          .from('compliance_records')
          .select('status')
          .eq('verification_id', sessionId)
          .eq('verification_type', 'identity')

        if (!complianceError && complianceData?.[0]?.status === 'approved') {
          console.log('✅ Verification approved, checking user status')
          
          // Check if user's KYC status has been updated
          const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('kyc_status')
            .eq('id', user?.id)
            .single()

          if (!userError && userData?.kyc_status === 'verified') {
            console.log('✅ Verification complete, stopping polling')
            clearInterval(pollInterval)
            setCheckingStatus(false)
            setIsVerified(true)
            setTimeout(() => {
              onVerificationComplete()
            }, 2000)
          }
        } else if (!complianceError && complianceData?.[0]?.status === 'rejected') {
          console.log('❌ Verification rejected')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Identity verification was rejected. Please contact support.')
        } else if (!complianceError && complianceData?.[0]?.status === 'expired') {
          console.log('⏰ Verification expired')
          clearInterval(pollInterval)
          setCheckingStatus(false)
          setError('Verification session expired. Please try again.')
        }
      } catch (error) {
        console.error('❌ Status polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setCheckingStatus(false)
      console.log('⏰ Status polling timeout')
      if (!isVerified) {
        setError('Verification timeout. Please try again or contact support.')
      }
    }, 10 * 60 * 1000)
  }

  // If user is already verified, show success state
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
          <Shield className="h-6