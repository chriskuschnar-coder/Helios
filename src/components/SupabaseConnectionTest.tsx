import React, { useEffect, useState } from 'react'
import { supabaseClient } from '../lib/supabase-client'
import { CheckCircle, XCircle, AlertTriangle, Database, Users, CreditCard } from 'lucide-react'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export function SupabaseConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const testResults: TestResult[] = []

    console.log('🧪 Running Supabase connection tests...')

    // Test 1: Environment Variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    console.log('Environment check:', { 
      url: supabaseUrl ? 'Set' : 'Missing', 
      key: supabaseKey ? 'Set' : 'Missing' 
    })
    if (supabaseUrl && supabaseKey) {
      testResults.push({
        name: 'Environment Variables',
        status: 'success',
        message: 'Supabase URL and API key are configured',
        details: `URL: ${supabaseUrl.substring(0, 30)}...`
      })
    } else {
      testResults.push({
        name: 'Environment Variables',
        status: 'error',
        message: 'Missing Supabase environment variables',
        details: `URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`
      })
    }

    // Test 2: Database Connection
    try {
      console.log('🔍 Testing database connection...')
      const { data, error } = await supabaseClient
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Database connection error:', error)
        testResults.push({
          name: 'Database Connection',
          status: 'error',
          message: 'Cannot connect to Supabase database',
          details: error.message
        })
      } else {
        console.log('✅ Database connection successful')
        testResults.push({
          name: 'Database Connection',
          status: 'success',
          message: 'Successfully connected to Supabase database'
        })
      }
    } catch (err) {
      console.error('Database connection exception:', err)
      testResults.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Database connection failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Test 3: Authentication System
    try {
      console.log('🔐 Testing authentication system...')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (session) {
        testResults.push({
          name: 'Authentication',
          status: 'success',
          message: 'User is authenticated',
          details: `Logged in as: ${session.user.email}`
        })
      } else {
        testResults.push({
          name: 'Authentication',
          status: 'warning',
          message: 'No active session (not logged in)',
          details: 'This is normal if user hasn\'t signed in yet'
        })
      }
    } catch (err) {
      testResults.push({
        name: 'Authentication',
        status: 'error',
        message: 'Authentication system error',
        details: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Test 4: Edge Functions
    try {
      console.log('⚡ Testing edge functions...')
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'OPTIONS'
      })
      
      if (response.ok) {
        testResults.push({
          name: 'Edge Functions',
          status: 'success',
          message: 'Stripe checkout edge function is accessible'
        })
      } else {
        testResults.push({
          name: 'Edge Functions',
          status: 'warning',
          message: 'Edge functions may not be deployed',
          details: `Status: ${response.status}`
        })
      }
    } catch (err) {
      testResults.push({
        name: 'Edge Functions',
        status: 'error',
        message: 'Cannot reach edge functions',
        details: 'Edge functions may not be deployed or accessible'
      })
    }

    // Test 5: Stripe Configuration
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    console.log('💳 Checking Stripe configuration...')
    
    if (stripePublishableKey) {
      testResults.push({
        name: 'Stripe Configuration',
        status: 'success',
        message: 'Stripe publishable key is configured',
        details: `Key: pk_test_...${stripePublishableKey.slice(-10)}`
      })
    } else {
      testResults.push({
        name: 'Stripe Configuration',
        status: 'warning',
        message: 'Stripe publishable key not configured',
        details: 'Using fallback test key for demo'
      })
    }

    console.log('🧪 All tests completed:', testResults)
    setTests(testResults)
    setLoading(false)
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default: return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div className="text-navy-900 text-lg font-medium">Testing Supabase Connection...</div>
        </div>
      </div>
    )
  }

  const hasErrors = tests.some(test => test.status === 'error')
  const allSuccess = tests.every(test => test.status === 'success')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 mb-2">
              Supabase System Status
            </h1>
            <p className="text-gray-600">
              Testing database connection, authentication, and payment integration
            </p>
          </div>

          {/* Overall Status */}
          <div className={`rounded-lg border p-4 mb-6 ${
            allSuccess ? 'bg-green-50 border-green-200' :
            hasErrors ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {allSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : hasErrors ? (
                <XCircle className="h-6 w-6 text-red-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className={`font-medium ${
                  allSuccess ? 'text-green-900' :
                  hasErrors ? 'text-red-900' :
                  'text-yellow-900'
                }`}>
                  {allSuccess ? 'All Systems Operational' :
                   hasErrors ? 'System Issues Detected' :
                   'Partial Functionality'}
                </p>
                <p className={`text-sm ${
                  allSuccess ? 'text-green-700' :
                  hasErrors ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {allSuccess ? 'Your hedge fund platform is fully operational' :
                   hasErrors ? 'Some components need attention' :
                   'App will work in demo mode'}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Test Results */}
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className={`rounded-lg border p-4 ${getBgColor(test.status)}`}>
                <div className="flex items-start space-x-3">
                  {getIcon(test.status)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{test.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{test.message}</div>
                    {test.details && (
                      <div className="text-xs text-gray-500 mt-2 font-mono bg-white p-2 rounded border">
                        {test.details}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-navy-50 rounded-lg p-6">
            <h3 className="font-medium text-navy-900 mb-4">Next Steps</h3>
            <div className="space-y-2 text-sm text-navy-700">
              {!supabaseUrl && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Click "Connect to Supabase" button in Bolt to set up database</span>
                </div>
              )}
              {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Add Stripe API keys for real payment processing</span>
                </div>
              )}
              {allSuccess && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System is ready for production use!</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Return to Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}