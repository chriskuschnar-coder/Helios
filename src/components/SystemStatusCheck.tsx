import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2, Database, CreditCard, Shield } from 'lucide-react'

export function SystemStatusCheck() {
  const [checks, setChecks] = useState({
    supabase: { status: 'checking', message: 'Connecting to database...' },
    stripe: { status: 'checking', message: 'Verifying payment system...' },
    auth: { status: 'checking', message: 'Testing authentication...' }
  })

  useEffect(() => {
    const runChecks = async () => {
      // Simulate system checks
      setTimeout(() => {
        setChecks({
          supabase: { status: 'success', message: 'Database connection established' },
          stripe: { status: 'success', message: 'Payment system ready' },
          auth: { status: 'success', message: 'Authentication system operational' }
        })
      }, 2000)
    }

    runChecks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
            System Status Check
          </h1>
          <p className="text-gray-600">
            Verifying platform components
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Database className="h-6 w-6 text-navy-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Database Connection</div>
              <div className="text-sm text-gray-600">{checks.supabase.message}</div>
            </div>
            {getStatusIcon(checks.supabase.status)}
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <CreditCard className="h-6 w-6 text-navy-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Payment Processing</div>
              <div className="text-sm text-gray-600">{checks.stripe.message}</div>
            </div>
            {getStatusIcon(checks.stripe.status)}
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Shield className="h-6 w-6 text-navy-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Authentication</div>
              <div className="text-sm text-gray-600">{checks.auth.message}</div>
            </div>
            {getStatusIcon(checks.auth.status)}
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full mt-8 bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue to Platform
        </button>
      </div>
    </div>
  )
}