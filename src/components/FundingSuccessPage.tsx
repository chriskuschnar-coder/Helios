import React, { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

export function FundingSuccessPage() {
  const { refreshAccount } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdFromUrl = urlParams.get('session_id')
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
      
      // Refresh account data to show updated balance
      const refreshData = async () => {
        try {
          await refreshAccount()
          setLoading(false)
        } catch (error) {
          console.error('Error refreshing account:', error)
          setLoading(false)
        }
      }
      
      // Wait a moment for webhook to process, then refresh
      setTimeout(refreshData, 2000)
    } else {
      setLoading(false)
    }
  }, [refreshAccount])

  const handleReturnToDashboard = () => {
    // Clear the URL parameters and return to dashboard
    window.history.replaceState({}, '', '/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your investment...</h2>
          <p className="text-gray-600">Please wait while we update your account</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
          Investment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your capital contribution has been processed successfully. Your trading account has been updated and you can now access all platform features.
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Transaction ID:</strong>
            </p>
            <p className="font-mono text-xs text-gray-800 break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Dashboard
          </button>
          
          <p className="text-xs text-gray-500">
            You will receive a confirmation email shortly with your investment details.
          </p>
        </div>
      </div>
    </div>
  )
}