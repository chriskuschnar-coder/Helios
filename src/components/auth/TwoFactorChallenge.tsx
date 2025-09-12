import React, { useState, useEffect } from 'react'
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw, Clock, Loader2, Phone, MessageSquare } from 'lucide-react'
import { Logo } from '../Logo'
import { useAuth } from './AuthProvider'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
  userEmail: string
  userData: any
  session: any
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  userEmail,
  userData,
  session
}) => {
  const { complete2FA } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [smsError, setSmsError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null)
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [smsCodeSent, setSmsCodeSent] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email')
  const [userPhone, setUserPhone] = useState('')
  const [hasPhoneOnFile, setHasPhoneOnFile] = useState(false)
  const [sendingEmailCode, setSendingEmailCode] = useState(false)
  const [sendingSmsCode, setSendingSmsCode] = useState(false)

  // Auto-focus and format code input
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').substring(0, 6)
    setVerificationCode(numericValue)
    // Clear errors when user starts typing
    setEmailError(null)
    setSmsError(null)
  }

  // Handle Enter key submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && !loading) {
      verifyCode()
    }
  }

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCountdown, canResend])

  // Check for phone number on mount
  useEffect(() => {
    console.log('🔐 2FA Challenge mounted - checking user data')
    
    // Check if user has phone number on file for SMS option
    if (userData?.phone || userData?.user_metadata?.phone) {
      const phoneNumber = userData.phone || userData.user_metadata?.phone
      setUserPhone(phoneNumber)
      setHasPhoneOnFile(true)
      console.log('📱 Phone number on file found:', phoneNumber.substring(0, 3) + '***')
    } else {
      console.log('📱 No phone number on file - SMS verification not available')
      setHasPhoneOnFile(false)
    }
    
    // DO NOT send initial code automatically - wait for user action
    console.log('🔐 2FA Challenge ready - waiting for user to request code')
  }, [])

  const sendEmailCode = async () => {
    if (resendCount >= 5) {
      setEmailError('Maximum resend attempts reached. Please wait 5 minutes before trying again.')
      return
    }

    setSendingEmailCode(true)
    setEmailError(null)
    setEmailSuccess(null)
    setEmailCodeSent(false)

    try {
      console.log('📧 Sending EMAIL verification code ONLY')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: userData?.id,
          email: userEmail
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Email API error:', errorData)
        
        // Handle specific email errors
        if (errorData.error?.includes('credits exceeded') || errorData.error?.includes('maximum credits')) {
          setEmailError('Email service temporarily unavailable - maximum credits exceeded. Please try SMS verification instead.')
        } else if (errorData.error?.includes('sender not verified')) {
          setEmailError('Email service configuration issue. Please try SMS verification instead.')
        } else {
          setEmailError(errorData.error || 'Email delivery failed. Please try SMS verification instead.')
        }
        return
      }

      const result = await response.json()
      console.log('✅ Email verification code sent successfully')
      
      setEmailCodeSent(true)
      setEmailSuccess(`Verification code sent to ${userEmail}`)
      setResendCount(prev => prev + 1)
      setCanResend(false)
      setResendCountdown(30)
      
    } catch (error) {
      console.error('❌ Failed to send email verification code:', error)
      setEmailError(error instanceof Error ? error.message : 'Failed to send email verification code')
    } finally {
      setSendingEmailCode(false)
    }
  }

  const sendSmsCode = async () => {
    if (!hasPhoneOnFile || !userPhone) {
      setSmsError('No phone number on file. SMS verification not available.')
      return
    }

    if (resendCount >= 5) {
      setSmsError('Maximum resend attempts reached. Please wait 5 minutes before trying again.')
      return
    }

    setSendingSmsCode(true)
    setSmsError(null)
    setSmsSuccess(null)
    setSmsCodeSent(false)

    try {
      console.log('📱 Sending SMS verification code ONLY')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-sms-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${session?.access_token}`,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          user_id: userData?.id,
          phone: userPhone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ SMS API error:', errorData)
        
        // Handle specific SMS errors
        if (errorData.error?.includes('not verified for trial')) {
          setSmsError('SMS service configuration issue. Please try email verification instead.')
        } else if (errorData.error?.includes('Invalid phone number')) {
          setSmsError('Invalid phone number format. Please try email verification instead.')
        } else {
          setSmsError(errorData.error || 'SMS delivery failed. Please try email verification instead.')
        }
        return
      }

      const result = await response.json()
      console.log('✅ SMS verification code sent successfully')
      
      setSmsCodeSent(true)
      setSmsSuccess(`Verification code sent via SMS to ${userPhone}`)
      setResendCount(prev => prev + 1)
      setCanResend(false)
      setResendCountdown(30)
      
    } catch (error) {
      console.error('❌ Failed to send SMS verification code:', error)
      setSmsError(error instanceof Error ? error.message : 'Failed to send SMS verification code')
    } finally {
      setSendingSmsCode(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      const currentError = 'Please enter the complete 6-digit verification code'
      if (verificationMethod === 'email') {
        setEmailError(currentError)
      } else {
        setSmsError(currentError)
      }
      return
    }

    if (!userData?.id) {
      const sessionError = 'Authentication session expired. Please sign in again.'
      if (verificationMethod === 'email') {
        setEmailError(sessionError)
      } else {
        setSmsError(sessionError)
      }
      return
    }
    
    setLoading(true)
    setEmailError(null)
    setSmsError(null)

    try {
      console.log(`🔐 Verifying ${verificationMethod} code for user:`, userData.id)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Use separate endpoints for email and SMS verification
      const endpoint = verificationMethod === 'email' ? 'verify-email-code' : 'verify-sms-code'
      const payload = verificationMethod === 'email' 
        ? { user_id: userData.id, code: verificationCode, email: userEmail }
        : { user_id: userData.id, code: verificationCode, phone: userPhone }

      const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Verification failed')
      }

      const result = await response.json()
      
      if (result.valid && result.success) {
        console.log(`✅ ${verificationMethod} verification successful`)
        
        // Show success message for the current method
        if (verificationMethod === 'email') {
          setEmailSuccess('Email verification successful! Redirecting to your account...')
        } else {
          setSmsSuccess('SMS verification successful! Redirecting to your account...')
        }
        
        // Use AuthProvider's complete2FA method for proper session handling
        const authResult = await complete2FA(verificationCode, userData, session, verificationMethod)
        
        if (authResult.success) {
          // Delay to show success message, then redirect
          setTimeout(() => {
            setLoading(false)
            console.log('🎉 Redirecting to dashboard')
            onSuccess()
          }, 1500)
        } else {
          throw new Error('Session setup failed')
        }
      } else {
        throw new Error(result.error || 'Invalid verification code. Please try again.')
      }
      
    } catch (error) {
      console.error(`❌ ${verificationMethod} verification failed:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code. Please try again.'
      
      // Set error for current method only
      if (verificationMethod === 'email') {
        setEmailError(errorMessage)
      } else {
        setSmsError(errorMessage)
      }
      setLoading(false)
    }
  }

  const resendCurrentMethodCode = async () => {
    if (!canResend) {
      const waitMessage = `Please wait ${resendCountdown} seconds before requesting another code`
      if (verificationMethod === 'email') {
        setEmailError(waitMessage)
      } else {
        setSmsError(waitMessage)
      }
      return
    }
    
    setVerificationCode('')
    
    // Call the appropriate method
    if (verificationMethod === 'email') {
      await sendEmailCode()
    } else {
      await sendSmsCode()
    }
  }

  const switchToSMS = () => {
    if (!hasPhoneOnFile || !userPhone) {
      setSmsError('No phone number on file. SMS verification not available.')
      return
    }
    
    console.log('🔄 Switching to SMS verification')
    
    // Clear all states
    setVerificationMethod('sms')
    setEmailError(null)
    setSmsError(null)
    setEmailSuccess(null)
    setSmsSuccess(null)
    setVerificationCode('')
    setResendCount(0)
    setCanResend(true)
    setResendCountdown(0)
    setEmailCodeSent(false)
    setSmsCodeSent(false)
    
    // Send SMS code immediately when switching
    setTimeout(() => {
      sendSmsCode()
    }, 100)
  }

  const switchToEmail = () => {
    console.log('🔄 Switching to email verification')
    
    // Clear all states
    setVerificationMethod('email')
    setEmailError(null)
    setSmsError(null)
    setEmailSuccess(null)
    setSmsSuccess(null)
    setVerificationCode('')
    setResendCount(0)
    setCanResend(true)
    setResendCountdown(0)
    setEmailCodeSent(false)
    setSmsCodeSent(false)
    
    // Send email code immediately when switching
    setTimeout(() => {
      sendEmailCode()
    }, 100)
  }

  // Get current method's status
  const getCurrentMethodStatus = () => {
    if (verificationMethod === 'email') {
      return {
        codeSent: emailCodeSent,
        success: emailSuccess,
        error: emailError,
        sending: sendingEmailCode
      }
    } else {
      return {
        codeSent: smsCodeSent,
        success: smsSuccess,
        error: smsError,
        sending: sendingSmsCode
      }
    }
  }

  const currentStatus = getCurrentMethodStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-navy-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Sign In</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Choose your verification method and enter the 6-digit code
            </p>
          </div>

          {/* Method Selector */}
          {hasPhoneOnFile && userPhone && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Verification Method:</h4>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={switchToEmail}
                  disabled={sendingEmailCode || sendingSmsCode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    verificationMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                  {emailError && <span className="text-xs text-red-500">(Error)</span>}
                </button>
                <button
                  onClick={switchToSMS}
                  disabled={sendingEmailCode || sendingSmsCode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    verificationMethod === 'sms'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>SMS</span>
                  {smsError && <span className="text-xs text-red-500">(Error)</span>}
                </button>
              </div>
            </div>
          )}

          {/* Send Code Button - Only show if no code sent for current method */}
          {!currentStatus.codeSent && !currentStatus.sending && (
            <div className="mb-6">
              <button
                onClick={verificationMethod === 'email' ? sendEmailCode : sendSmsCode}
                disabled={currentStatus.sending}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                  verificationMethod === 'email'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {currentStatus.sending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending {verificationMethod === 'email' ? 'Email' : 'SMS'}...</span>
                  </>
                ) : (
                  <>
                    {verificationMethod === 'email' ? (
                      <Mail className="h-5 w-5" />
                    ) : (
                      <MessageSquare className="h-5 w-5" />
                    )}
                    <span>Send {verificationMethod === 'email' ? 'Email' : 'SMS'} Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Code Sent Status - Only for current method */}
          {currentStatus.codeSent && (
            <div className={`border rounded-xl p-4 mb-6 animate-in fade-in duration-500 ${
              verificationMethod === 'email' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  verificationMethod === 'email' 
                    ? 'bg-blue-100' 
                    : 'bg-green-100'
                }`}>
                  {verificationMethod === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Phone className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    verificationMethod === 'email' ? 'text-blue-900' : 'text-green-900'
                  }`}>
                    Verification Code Sent
                  </h3>
                  <p className={`text-sm ${
                    verificationMethod === 'email' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {verificationMethod === 'email' ? 'Check your email:' : 'Check your phone:'}{' '}
                    <span className="font-medium">
                      {verificationMethod === 'email' ? userEmail : userPhone}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message - Only for current method */}
          {currentStatus.success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-in fade-in duration-500">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-900 font-medium">{currentStatus.success}</span>
              </div>
            </div>
          )}

          {/* Error Message - Only for current method */}
          {currentStatus.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-in fade-in duration-300">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-900 font-medium">{currentStatus.error}</span>
              </div>
              
              {/* Auto-suggest alternative method */}
              {verificationMethod === 'email' && emailError?.includes('credits exceeded') && hasPhoneOnFile && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <button
                    onClick={switchToSMS}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Try SMS Verification Instead</span>
                  </button>
                </div>
              )}
              
              {verificationMethod === 'sms' && smsError?.includes('configuration issue') && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <button
                    onClick={switchToEmail}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center space-x-1"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Try Email Verification Instead</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verification Code Input - Only show if code was sent */}
          {currentStatus.codeSent && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-4 text-center text-3xl font-mono font-bold border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 tracking-widest bg-gray-50 focus:bg-white"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={loading || currentStatus.sending}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit code from your {verificationMethod === 'email' ? 'email' : 'text message'}
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6 || currentStatus.sending}
                className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the code?
                </p>
                <div className="space-y-3">
                  {canResend && !currentStatus.sending ? (
                    <button
                      onClick={resendCurrentMethodCode}
                      className={`${
                        verificationMethod === 'email' ? 'text-blue-600 hover:text-blue-700' : 'text-green-600 hover:text-green-700'
                      } text-sm font-semibold transition-colors hover:underline flex items-center space-x-1 mx-auto`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Resend {verificationMethod === 'email' ? 'Email' : 'SMS'} Code</span>
                    </button>
                  ) : currentStatus.sending ? (
                    <div className="text-sm text-gray-500 flex items-center space-x-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending {verificationMethod === 'email' ? 'email' : 'SMS'}...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Resend available in <span className={`font-mono font-bold ${
                        verificationMethod === 'email' ? 'text-blue-600' : 'text-green-600'
                      }`}>{resendCountdown}s</span>
                    </div>
                  )}
                  
                  {/* Alternative method option - only show if current method has issues */}
                  {hasPhoneOnFile && userPhone && verificationMethod === 'email' && emailError && !currentStatus.sending && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">
                        Email verification having issues?
                      </p>
                      <button
                        onClick={switchToSMS}
                        className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors flex items-center space-x-1 mx-auto"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Use SMS instead ({userPhone})</span>
                      </button>
                    </div>
                  )}
                  
                  {hasPhoneOnFile && userPhone && verificationMethod === 'sms' && smsError && !currentStatus.sending && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">SMS verification having issues?</p>
                      <button
                        onClick={switchToEmail}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1 mx-auto"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Switch to email</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {resendCount > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Attempts: {resendCount}/5
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Initial method selection if no code sent yet */}
          {!currentStatus.codeSent && !currentStatus.sending && !hasPhoneOnFile && (
            <div className="mb-6">
              <button
                onClick={sendEmailCode}
                disabled={sendingEmailCode}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                {sendingEmailCode ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Send Email Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Security Notice</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Never share your verification code with anyone</li>
                    <li>• This code expires in {verificationMethod === 'email' ? '10' : '5'} minutes</li>
                    <li>• If you didn't request this, contact support immediately</li>
                    {verificationMethod === 'sms' && (
                      <li>• SMS charges may apply from your carrier</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact{' '}
              <a 
                href="mailto:support@globalmarketsconsulting.com" 
                className="text-navy-600 hover:text-navy-700 font-medium transition-colors"
              >
                support@globalmarketsconsulting.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}