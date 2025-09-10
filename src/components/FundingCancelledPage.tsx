import React from 'react'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'

export function FundingCancelledPage() {
  const handleReturnToDashboard = () => {
    window.history.replaceState({}, '', '/')
    window.location.reload()
  }

  const handleTryAgain = () => {
    window.history.replaceState({}, '', '/')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
          Investment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your investment process was cancelled. No charges were made to your account. 
          You can try again anytime or contact our team if you need assistance.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Try Investment Again
          </button>
          
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}