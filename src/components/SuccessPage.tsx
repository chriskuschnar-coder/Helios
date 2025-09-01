import React, { useEffect, useState } from 'react'
import { CheckCircle, Home, Receipt, ArrowRight } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'

export function SuccessPage() {
  const { refreshAccount, refreshSubscription } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdFromUrl = urlParams.get('session_id')
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
      
      // Refresh user data to reflect any changes
      const refreshData = async () => {
        try {
          await Promise.all([
            refreshAccount(),
            refreshSubscription()
          ])
        } catch (error) {
          console.error('Error refreshing data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      // Wait a moment for webhook to process, then refresh
      setTimeout(refreshData, 2000)
    } else {
      setLoading(false)
    }
  }, [refreshAccount, refreshSubscription])

  const handleReturnHome = () => {
    // Clear the URL parameters and return to dashboard
    window.history.replaceState({}, '', '/')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your transaction</p>
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
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your investment. Your payment has been processed successfully 
          and you will receive a confirmation email shortly.
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Receipt className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Transaction Reference</span>
            </div>
            <p className="font-mono text-sm text-gray-600 break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleReturnHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Dashboard
          </button>
          
          <p className="text-xs text-gray-500">
            Your account will be updated within a few minutes
          </p>
        </div>
      </div>
    </div>
  )
}