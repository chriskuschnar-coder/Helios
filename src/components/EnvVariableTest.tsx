import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Key, Globe, Eye, EyeOff } from 'lucide-react'

interface EnvTest {
  name: string
  value: string | undefined
  required: boolean
  description: string
}

export function EnvVariableTest() {
  const [showKeys, setShowKeys] = useState(false)
  const [envTests, setEnvTests] = useState<EnvTest[]>([])

  useEffect(() => {
    // Test all environment variables
    const tests: EnvTest[] = [
      {
        name: 'VITE_SUPABASE_URL',
        value: import.meta.env.VITE_SUPABASE_URL,
        required: true,
        description: 'Supabase project URL'
      },
      {
        name: 'VITE_SUPABASE_ANON_KEY',
        value: import.meta.env.VITE_SUPABASE_ANON_KEY,
        required: true,
        description: 'Supabase anonymous/public key'
      },
      {
        name: 'VITE_STRIPE_PUBLISHABLE_KEY',
        value: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        required: false,
        description: 'Stripe publishable key for payments'
      },
      {
        name: 'NODE_ENV',
        value: import.meta.env.NODE_ENV,
        required: false,
        description: 'Node environment'
      },
      {
        name: 'MODE',
        value: import.meta.env.MODE,
        required: false,
        description: 'Vite mode'
      },
      {
        name: 'DEV',
        value: import.meta.env.DEV?.toString(),
        required: false,
        description: 'Development mode flag'
      }
    ]

    setEnvTests(tests)
  }, [])

  const getStatus = (test: EnvTest) => {
    if (test.required && !test.value) return 'error'
    if (test.value) return 'success'
    return 'warning'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Key className="h-5 w-5 text-gray-600" />
    }
  }

  const maskValue = (value: string | undefined, show: boolean) => {
    if (!value) return 'Not set'
    if (show) return value
    if (value.length > 20) {
      return value.substring(0, 20) + '...' + value.substring(value.length - 10)
    }
    return value.substring(0, 10) + '...'
  }

  const validateSupabaseUrl = (url: string | undefined) => {
    if (!url) return { valid: false, message: 'URL not set' }
    
    try {
      const parsed = new URL(url)
      if (parsed.hostname.includes('supabase.co')) {
        return { valid: true, message: 'Valid Supabase URL format' }
      } else {
        return { valid: false, message: 'URL does not appear to be a Supabase URL' }
      }
    } catch {
      return { valid: false, message: 'Invalid URL format' }
    }
  }

  const validateJWT = (token: string | undefined) => {
    if (!token) return { valid: false, message: 'Token not set' }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, message: `Invalid JWT format (${parts.length} parts, should be 3)` }
    }
    
    try {
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      
      return { 
        valid: true, 
        message: 'Valid JWT format',
        details: { header, payload: { ...payload, exp: new Date(payload.exp * 1000).toISOString() } }
      }
    } catch {
      return { valid: false, message: 'Could not decode JWT' }
    }
  }

  const supabaseUrlValidation = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
  const jwtValidation = validateJWT(import.meta.env.VITE_SUPABASE_ANON_KEY)

  const requiredMissing = envTests.filter(test => test.required && !test.value).length
  const allPresent = envTests.filter(test => test.value).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Environment Variables Test
            </h1>
            <p className="text-gray-600">
              Verifying that Vite is loading your environment variables correctly
            </p>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900">{allPresent}</div>
              <div className="text-sm text-green-700">Variables Found</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-red-900">{requiredMissing}</div>
              <div className="text-sm text-red-700">Required Missing</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">{window.location.origin}</div>
              <div className="text-sm text-blue-700">Current Origin</div>
            </div>
          </div>

          {/* Show/Hide Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Environment Variables</h2>
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showKeys ? 'Hide' : 'Show'} Values</span>
            </button>
          </div>

          {/* Environment Variables List */}
          <div className="space-y-4 mb-8">
            {envTests.map((test, index) => {
              const status = getStatus(test)
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  status === 'success' ? 'border-green-200 bg-green-50' :
                  status === 'error' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Value: </span>
                          <code className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                            {maskValue(test.value, showKeys)}
                          </code>
                        </div>
                        {test.required && !test.value && (
                          <div className="mt-2 text-sm text-red-600">
                            ⚠️ This is required for the app to work
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Supabase URL Validation */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Supabase URL Validation</h3>
            <div className={`flex items-center space-x-2 ${supabaseUrlValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
              {supabaseUrlValidation.valid ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span>{supabaseUrlValidation.message}</span>
            </div>
            {import.meta.env.VITE_SUPABASE_URL && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Your URL:</strong> {import.meta.env.VITE_SUPABASE_URL}
              </div>
            )}
          </div>

          {/* JWT Validation */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">JWT Token Validation</h3>
            <div className={`flex items-center space-x-2 ${jwtValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
              {jwtValidation.valid ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span>{jwtValidation.message}</span>
            </div>
            {jwtValidation.details && showKeys && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Show JWT Details
                </summary>
                <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(jwtValidation.details, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-3">How to Fix Missing Variables:</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div><strong>Option 1:</strong> Click "Connect to Supabase" button in Bolt (top right)</div>
              <div><strong>Option 2:</strong> Create a <code>.env</code> file in your project root with:</div>
              <pre className="bg-blue-100 p-3 rounded mt-2 text-xs">
{`VITE_SUPABASE_URL=https://upevugqarcvxnekzddeh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here`}
              </pre>
              <div><strong>Option 3:</strong> Set them in Bolt's environment settings</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="text-navy-600 hover:text-navy-700 font-medium"
            >
              ← Back to Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}