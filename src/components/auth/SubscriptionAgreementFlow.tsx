import React, { useState, useEffect, useRef } from 'react'
import { FileText, CheckCircle, AlertCircle, Download, ArrowRight, ArrowLeft, Eye, PenTool, Clock, Shield, User, Mail, Calendar, Hash, Loader2 } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface SubscriptionAgreementFlowProps {
  onComplete: () => void
  onCancel: () => void
}

interface AgreementData {
  full_name: string
  email: string
  investment_amount: number
  account_number: string
  date_signed: string
  user_id: string
}

export const SubscriptionAgreementFlow: React.FC<SubscriptionAgreementFlowProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const { user, account } = useAuth()
  const [currentStep, setCurrentStep] = useState<'review' | 'sign' | 'confirmation'>('review')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [signature, setSignature] = useState('')
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>('typed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null)
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null)
  const documentRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize agreement data
  useEffect(() => {
    if (user && account) {
      setAgreementData({
        full_name: user.full_name || user.email.split('@')[0],
        email: user.email,
        investment_amount: account.balance || 250000, // Default investment amount
        account_number: `GMC-${user.id.slice(-8).toUpperCase()}`,
        date_signed: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        user_id: user.id
      })
    }
  }, [user, account])

  // Handle document scroll tracking
  const handleDocumentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight - element.clientHeight
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
    
    setScrollProgress(progress)
    
    // Mark as fully read when user scrolls to 90% or more
    if (progress >= 90 && !hasScrolledToEnd) {
      setHasScrolledToEnd(true)
    }
  }

  // Canvas signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    setSignature('')
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#1e40af'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [signatureType])

  const submitSignature = async () => {
    if (!agreementData) {
      setError('Agreement data not available')
      return
    }

    if (signatureType === 'typed' && !signature.trim()) {
      setError('Please enter your full name as your signature')
      return
    }

    if (signatureType === 'drawn' && !signature) {
      setError('Please draw your signature in the box above')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📝 Submitting subscription agreement signature')
      
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      // Call edge function to process and store signed agreement
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/process-subscription-agreement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          agreement_data: agreementData,
          signature: signature,
          signature_type: signatureType,
          ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'unknown'),
          user_agent: navigator.userAgent
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process agreement')
      }

      const result = await response.json()
      console.log('✅ Agreement processed successfully:', result)
      
      setSignedDocumentUrl(result.signed_document_url)
      setCurrentStep('confirmation')
      
    } catch (error) {
      console.error('❌ Agreement submission failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit agreement')
    } finally {
      setLoading(false)
    }
  }

  const proceedToPortal = () => {
    console.log('🎉 Proceeding to portal after agreement completion')
    onComplete()
  }

  if (!agreementData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-navy-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Agreement</h3>
          <p className="text-gray-600">Preparing your subscription documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Subscription Agreement</h1>
                <p className="text-sm text-gray-600">Step {currentStep === 'review' ? '1' : currentStep === 'sign' ? '2' : '3'} of 3</p>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-navy-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'review' ? 'bg-navy-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {currentStep === 'review' ? '1' : <CheckCircle className="h-4 w-4" />}
              </div>
              <span className="font-medium">Review Agreement</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep !== 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center space-x-2 ${
              currentStep === 'sign' ? 'text-navy-600' : 
              currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'sign' ? 'bg-navy-600 text-white' :
                currentStep === 'confirmation' ? 'bg-green-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {currentStep === 'confirmation' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium">Electronic Signature</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep === 'confirmation' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span className="font-medium">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'review' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Document Header */}
            <div className="bg-navy-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Global Markets Consulting LLC</h2>
                  <p className="text-navy-200">Subscription Agreement</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-navy-200">Document ID</div>
                  <div className="font-mono text-lg">{agreementData.account_number}</div>
                </div>
              </div>
            </div>

            {/* Scroll Progress */}
            <div className="bg-gray-100 h-2">
              <div 
                className="bg-navy-600 h-2 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              ></div>
            </div>

            {/* Document Content */}
            <div 
              ref={documentRef}
              onScroll={handleDocumentScroll}
              className="h-96 overflow-y-auto p-6 bg-gray-50"
            >
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">SUBSCRIPTION AGREEMENT</h1>
                  <p className="text-lg text-gray-600">Global Markets Consulting LLC</p>
                  <p className="text-sm text-gray-500">A Delaware Limited Liability Company</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3">Subscriber Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Name:</span>
                        <span className="font-medium text-gray-900">{agreementData.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Email:</span>
                        <span className="font-medium text-gray-900">{agreementData.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Account:</span>
                        <span className="font-medium text-gray-900">{agreementData.account_number}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3">Investment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Date:</span>
                        <span className="font-medium text-gray-900">{agreementData.date_signed}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">Investment Amount:</span>
                        <span className="font-bold text-green-600">${agreementData.investment_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <h2>1. SUBSCRIPTION</h2>
                  <p>
                    The undersigned (the "Subscriber") hereby subscribes for membership interests in Global Markets Consulting LLC 
                    (the "Company") and agrees to contribute the amount specified above as capital to the Company.
                  </p>

                  <h2>2. REPRESENTATIONS AND WARRANTIES</h2>
                  <p>The Subscriber represents and warrants that:</p>
                  <ul>
                    <li>The Subscriber has received and carefully reviewed the Company's Private Placement Memorandum</li>
                    <li>The Subscriber understands the risks associated with this investment</li>
                    <li>The Subscriber meets the definition of an "accredited investor" under federal securities laws</li>
                    <li>This investment is suitable for the Subscriber's financial situation and investment objectives</li>
                  </ul>

                  <h2>3. INVESTMENT RISKS</h2>
                  <p>
                    <strong>THE SUBSCRIBER ACKNOWLEDGES THAT:</strong> This investment involves substantial risks, 
                    including the possible loss of the entire investment. The Company's trading strategies may result 
                    in significant losses. Past performance does not guarantee future results.
                  </p>

                  <h2>4. ACCREDITED INVESTOR STATUS</h2>
                  <p>
                    By signing below, the Subscriber certifies that they qualify as an "accredited investor" as defined 
                    in Rule 501(a) of Regulation D under the Securities Act of 1933, as amended.
                  </p>

                  <h2>5. GOVERNING LAW</h2>
                  <p>
                    This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, 
                    without regard to its conflict of laws principles.
                  </p>

                  <h2>6. ELECTRONIC SIGNATURE</h2>
                  <p>
                    The Subscriber agrees that electronic signatures shall have the same legal effect as handwritten signatures 
                    and that this Agreement may be executed electronically.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Important Notice</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Please read this entire agreement carefully. By proceeding to sign, you acknowledge that you have 
                      read, understood, and agree to be bound by all terms and conditions set forth herein.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Reading Progress: {Math.round(scrollProgress)}%
                  </div>
                  {hasScrolledToEnd && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Document Reviewed</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentStep('sign')}
                  disabled={!hasScrolledToEnd}
                  className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Proceed to Sign</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'sign' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Electronic Signature</h2>
              <p className="text-gray-600">
                Please provide your electronic signature to complete the subscription agreement
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

            {/* Signature Type Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Signature Method</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSignatureType('typed')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    signatureType === 'typed' 
                      ? 'border-navy-500 bg-navy-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Type Your Name</h4>
                      <p className="text-sm text-gray-600">Enter your full legal name</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSignatureType('drawn')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    signatureType === 'drawn' 
                      ? 'border-navy-500 bg-navy-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PenTool className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Draw Signature</h4>
                      <p className="text-sm text-gray-600">Sign with mouse or touch</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Signature Input */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Signature</h3>
              
              {signatureType === 'typed' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Legal Name (as it appears on your ID)
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder={agreementData.full_name}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent font-serif"
                    style={{ fontFamily: 'Brush Script MT, cursive' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will serve as your legal electronic signature
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Draw Your Signature
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={150}
                      className="w-full h-32 border border-gray-200 rounded cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-500">
                        Sign above using your mouse or finger
                      </p>
                      <button
                        onClick={clearSignature}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Acknowledgments */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Legal Acknowledgments</h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500" required />
                  <span className="text-sm text-gray-700">
                    I acknowledge that I have read and understood the entire Subscription Agreement and Private Placement Memorandum
                  </span>
                </label>
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500" required />
                  <span className="text-sm text-gray-700">
                    I certify that I am an accredited investor as defined under federal securities laws
                  </span>
                </label>
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500" required />
                  <span className="text-sm text-gray-700">
                    I understand the risks associated with this investment and that I may lose my entire investment
                  </span>
                </label>
                <label className="flex items-start space-x-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-navy-600 focus:ring-navy-500" required />
                  <span className="text-sm text-gray-700">
                    I agree that my electronic signature has the same legal effect as a handwritten signature
                  </span>
                </label>
              </div>
            </div>

            {/* Sign Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('review')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Review</span>
              </button>
              
              <button
                onClick={submitSignature}
                disabled={loading || !signature.trim()}
                className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Signature...</span>
                  </>
                ) : (
                  <>
                    <PenTool className="h-4 w-4" />
                    <span>Sign Agreement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Agreement Signed Successfully!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your subscription agreement has been electronically signed and securely stored. 
              You now have full access to the Global Markets Consulting investment platform.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Agreement Details</h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <div>Signed by: {agreementData.full_name}</div>
                    <div>Date: {agreementData.date_signed}</div>
                    <div>Account: {agreementData.account_number}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <div>✅ Agreement executed and stored</div>
                    <div>✅ Account activated for trading</div>
                    <div>✅ Ready to access investment portal</div>
                  </div>
                </div>
              </div>
            </div>

            {signedDocumentUrl && (
              <div className="mb-8">
                <a
                  href={signedDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Signed Agreement</span>
                </a>
              </div>
            )}

            <button
              onClick={proceedToPortal}
              className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Access Investment Portal
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Document Security</span>
              </div>
              <p className="text-xs text-gray-600">
                Your signed agreement is encrypted and stored securely. You can access it anytime from your account settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}