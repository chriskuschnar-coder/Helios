import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Database, CheckCircle, AlertCircle, Loader2, Globe, Key, Server } from 'lucide-react'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: any
  timestamp: string
}

export function SupabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [autoRun, setAutoRun] = useState(true)

  const addResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details: any = null) => {
    setResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      details, 
      timestamp: new Date().toISOString() 
    }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables
    addResult("Environment Check", "info", "Checking environment variables...")
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      addResult("VITE_SUPABASE_URL", "error", "Missing VITE_SUPABASE_URL environment variable")
    } else {
      addResult("VITE_SUPABASE_URL", "success", `Found: ${supabaseUrl}`)
      
      // Validate URL format
      try {
        new URL(supabaseUrl)
        addResult("URL Format", "success", "URL format is valid")
      } catch {
        addResult("URL Format", "error", "Invalid URL format")
      }
    }
    
    if (!supabaseAnonKey) {
      addResult("VITE_SUPABASE_ANON_KEY", "error", "Missing VITE_SUPABASE_ANON_KEY environment variable")
    } else {
      addResult("VITE_SUPABASE_ANON_KEY", "success", `Found: ${supabaseAnonKey.substring(0, 50)}...`)
      
      // Check JWT format
      const jwtParts = supabaseAnonKey.split('.')
      if (jwtParts.length === 3) {
        addResult("JWT Format", "success", "Anon key has valid JWT structure")
        
        // Try to decode JWT header
        try {
          const header = JSON.parse(atob(jwtParts[0]))
          addResult("JWT Header", "success", "JWT header decoded successfully", header)
        } catch {
          addResult("JWT Header", "warning", "Could not decode JWT header")
        }
      } else {
        addResult("JWT Format", "error", `Invalid JWT structure (${jwtParts.length} parts, should be 3)`)
      }
    }

    // Test 2: Network Environment
    addResult("Network Environment", "info", "Checking network environment...")
    addResult("Current Origin", "info", `Running from: ${window.location.origin}`)
    addResult("User Agent", "info", `Browser: ${navigator.userAgent.substring(0, 100)}...`)
    
    // Check if we're in WebContainer
    const isWebContainer = window.location.hostname.includes('webcontainer') || 
                          window.location.hostname.includes('stackblitz') ||
                          window.location.hostname.includes('bolt.new')
    addResult("Environment Type", isWebContainer ? "warning" : "info", 
             isWebContainer ? "Running in WebContainer environment" : "Running in standard environment")

    if (!supabaseUrl || !supabaseAnonKey) {
      setIsRunning(false)
      return
    }

    // Test 3: Create Supabase Client
    addResult("Client Creation", "info", "Creating Supabase client...")
    
    let client: any
    try {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      })
      addResult("Client Creation", "success", "Supabase client created successfully")
    } catch (error: any) {
      addResult("Client Creation", "error", `Failed to create client: ${error.message}`)
      setIsRunning(false)
      return
    }

    // Test 4: Basic Connection Test
    addResult("Database Connection", "info", "Testing database connection...")
    
    try {
      const { data, error } = await client.from('users').select('count').limit(1)
      
      if (error) {
        addResult("Database Connection", "error", `Database query failed: ${error.message}`, {
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      } else {
        addResult("Database Connection", "success", "Successfully connected to database", data)
      }
    } catch (fetchError: any) {
      addResult("Database Connection", "error", `Network error: ${fetchError.message}`, {
        name: fetchError.name,
        stack: fetchError.stack?.substring(0, 500)
      })
    }

    // Test 5: Test Different Tables
    const tables = ['accounts', 'transactions', 'payments']
    
    for (const table of tables) {
      addResult(`Table Access: ${table}`, "info", `Testing access to ${table} table...`)
      
      try {
        const { data, error } = await client.from(table).select('count').limit(1)
        
        if (error) {
          addResult(`Table Access: ${table}`, "error", `Failed to access ${table}: ${error.message}`, error)
        } else {
          addResult(`Table Access: ${table}`, "success", `Successfully accessed ${table} table`, data)
        }
      } catch (fetchError: any) {
        addResult(`Table Access: ${table}`, "error", `Network error on ${table}: ${fetchError.message}`)
      }
    }

    // Test 6: Authentication Test
    addResult("Auth Test", "info", "Testing authentication system...")
    
    try {
      const { data: session, error } = await client.auth.getSession()
      
      if (error) {
        addResult("Auth Test", "error", `Auth error: ${error.message}`, error)
      } else {
        addResult("Auth Test", "success", `Auth system working. Current session: ${session?.session ? 'Active' : 'None'}`, session)
      }
    } catch (authError: any) {
      addResult("Auth Test", "error", `Auth system error: ${authError.message}`)
    }

    // Test 7: Direct REST API Test
    addResult("Direct API Test", "info", "Testing direct REST API access...")
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const responseText = await response.text()
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          addResult("Direct API Test", "success", "Direct REST API working", data)
        } catch {
          addResult("Direct API Test", "success", "Direct REST API responding", { response: responseText })
        }
      } else {
        addResult("Direct API Test", "error", `HTTP ${response.status}: ${response.statusText}`, {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        })
      }
    } catch (fetchError: any) {
      addResult("Direct API Test", "error", `Direct fetch failed: ${fetchError.message}`, fetchError)
    }

    // Test 8: Edge Functions Test
    addResult("Edge Functions Test", "info", "Testing Edge Functions access...")
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      
      if (response.ok || response.status === 404) {
        addResult("Edge Functions Test", "success", "Edge Functions endpoint accessible")
      } else {
        addResult("Edge Functions Test", "warning", `Edge Functions returned ${response.status}`)
      }
    } catch (error: any) {
      addResult("Edge Functions Test", "error", `Edge Functions test failed: ${error.message}`)
    }

    setIsRunning(false)
  }

  // Auto-run on mount
  useEffect(() => {
    if (autoRun) {
      runDiagnostics()
      setAutoRun(false)
    }
  }, [autoRun])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5" />
      case 'error': return <AlertCircle className="h-5 w-5" />
      case 'warning': return <AlertCircle className="h-5 w-5" />
      case 'info': return <Loader2 className="h-5 w-5" />
      default: return <Globe className="h-5 w-5" />
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Supabase Connection Diagnostics
            </h1>
            <p className="text-gray-600">
              Comprehensive testing to identify connection issues
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-navy-600 text-white hover:bg-navy-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Server className="h-5 w-5" />
                  <span>Run Connection Tests</span>
                </>
              )}
            </button>

            {results.length > 0 && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">{successCount} Passed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">{errorCount} Failed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">{warningCount} Warnings</span>
                </div>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-medium">{result.test}</h3>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs hover:underline">
                              Show Technical Details
                            </summary>
                            <pre className="mt-2 text-xs bg-white bg-opacity-50 p-3 rounded border overflow-auto max-h-40">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <span className="text-xs opacity-60">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isRunning && results.length > 0 && (
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-900">{successCount}</div>
                <div className="text-sm text-green-700">Tests Passed</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="font-bold text-red-900">{errorCount}</div>
                <div className="text-sm text-red-700">Tests Failed</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-bold text-yellow-900">{warningCount}</div>
                <div className="text-sm text-yellow-700">Warnings</div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-navy-50 border border-navy-200 rounded-lg">
            <h3 className="font-medium text-navy-900 mb-2">Quick Fix Guide:</h3>
            <div className="text-sm text-navy-700 space-y-1">
              <div>• If environment variables are missing: Click "Connect to Supabase" in Bolt</div>
              <div>• If connection fails: Check if your Supabase project is active</div>
              <div>• If auth fails: Verify RLS policies are set correctly</div>
              <div>• If tables missing: Run database migrations</div>
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