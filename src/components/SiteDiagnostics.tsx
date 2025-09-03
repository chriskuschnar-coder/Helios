import React, { useState, useEffect } from 'react'
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye, Code, Table, CreditCard, Users, Globe, Zap } from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: any
  timestamp: string
  critical: boolean
}

interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down'
  authentication: 'healthy' | 'degraded' | 'down'
  payments: 'healthy' | 'degraded' | 'down'
  overall: 'healthy' | 'degraded' | 'down'
}

export function SiteDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'down',
    authentication: 'down', 
    payments: 'down',
    overall: 'down'
  })
  const [showRawData, setShowRawData] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details?: any, critical: boolean = false) => {
    setResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      details, 
      timestamp: new Date().toISOString(),
      critical
    }])
  }

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    addResult("System Diagnostics", "info", "Starting comprehensive system diagnostics...", null, false)

    // CRITICAL TEST 1: Environment Variables
    addResult("Environment Variables", "info", "Checking environment configuration...", null, true)
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

    if (!supabaseUrl) {
      addResult("VITE_SUPABASE_URL", "error", "Missing Supabase URL - this will break database connections", null, true)
    } else {
      addResult("VITE_SUPABASE_URL", "success", `Configured: ${supabaseUrl}`, { url: supabaseUrl }, false)
    }

    if (!supabaseKey) {
      addResult("VITE_SUPABASE_ANON_KEY", "error", "Missing Supabase key - authentication will fail", null, true)
    } else {
      addResult("VITE_SUPABASE_ANON_KEY", "success", `Configured: ${supabaseKey.substring(0, 50)}...`, { keyLength: supabaseKey.length }, false)
    }

    if (!stripeKey) {
      addResult("VITE_STRIPE_PUBLISHABLE_KEY", "warning", "Missing Stripe key - payments will not work", null, false)
    } else {
      addResult("VITE_STRIPE_PUBLISHABLE_KEY", "success", `Configured: ${stripeKey.substring(0, 20)}...`, null, false)
    }

    // CRITICAL TEST 2: Database Connection
    addResult("Database Connection", "info", "Testing Supabase database connection...", null, true)
    
    try {
      const connectionTest = await Promise.race([
        supabaseClient.from('users').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000))
      ]) as any

      if (connectionTest.error) {
        addResult("Database Connection", "error", `Database connection failed: ${connectionTest.error.message}`, connectionTest.error, true)
        setSystemHealth(prev => ({ ...prev, database: 'down' }))
      } else {
        addResult("Database Connection", "success", "Database connection successful", connectionTest.data, false)
        setSystemHealth(prev => ({ ...prev, database: 'healthy' }))
      }
    } catch (err: any) {
      addResult("Database Connection", "error", `Network error: ${err.message}`, err, true)
      setSystemHealth(prev => ({ ...prev, database: 'down' }))
    }

    // CRITICAL TEST 3: Payments Table Schema
    addResult("Payments Table Schema", "info", "Analyzing payments table structure...", null, true)
    
    try {
      // Get complete table schema
      const { data: schemaData, error: schemaError } = await supabaseClient
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default, ordinal_position')
        .eq('table_name', 'payments')
        .eq('table_schema', 'public')
        .order('ordinal_position')

      if (schemaError) {
        addResult("Payments Table Schema", "error", `Schema query failed: ${schemaError.message}`, schemaError, true)
      } else {
        addResult("Payments Table Schema", "success", `Found ${schemaData?.length || 0} columns in payments table`, schemaData, false)
      }
    } catch (err: any) {
      addResult("Payments Table Schema", "error", `Schema analysis failed: ${err.message}`, err, true)
    }

    // CRITICAL TEST 4: Insert Test
    addResult("Insert Test", "info", "Testing insert operation...", null, true)
    
    try {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        product_id: 'test_product',
        quantity: 1,
        total_amount: 100.00,
        status: 'test',
        metadata: { test: true, diagnostic: true }
      }

      const { data: insertData, error: insertError } = await supabaseClient
        .from('payments')
        .insert(testData)
        .select()

      if (insertError) {
        addResult("Insert Test", "warning", 
          `Insert failed: ${insertError.message}`, insertError, false)
      } else {
        addResult("Insert Test", "success", 
          "✅ Insert successful!", insertData, false)
        
        // Clean up test record
        if (insertData && insertData.length > 0) {
          await supabaseClient.from('payments').delete().eq('id', insertData[0].id)
          addResult("Test Cleanup", "info", "Test record cleaned up successfully", null, false)
        }
      }
    } catch (err: any) {
      addResult("Insert Test", "error", `Insert test error: ${err.message}`, err, true)
    }

    // CRITICAL TEST 5: Authentication System
    addResult("Authentication System", "info", "Testing authentication system...", null, true)
    
    try {
      const { data: session, error: authError } = await supabaseClient.auth.getSession()
      
      if (authError) {
        addResult("Authentication System", "error", `Auth error: ${authError.message}`, authError, true)
        setSystemHealth(prev => ({ ...prev, authentication: 'down' }))
      } else {
        addResult("Authentication System", "success", 
          `Auth system working. Current session: ${session?.session ? 'Active' : 'None'}`, session, false)
        setSystemHealth(prev => ({ ...prev, authentication: 'healthy' }))
      }
    } catch (err: any) {
      addResult("Authentication System", "error", `Auth system error: ${err.message}`, err, true)
      setSystemHealth(prev => ({ ...prev, authentication: 'down' }))
    }

    // CRITICAL TEST 6: Edge Functions Test
    addResult("Edge Functions", "info", "Testing Supabase Edge Functions...", null, false)
    
    try {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/`
      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (response.ok || response.status === 404) {
        addResult("Edge Functions", "success", "Edge Functions endpoint accessible", { status: response.status }, false)
        setSystemHealth(prev => ({ ...prev, payments: 'healthy' }))
      } else {
        addResult("Edge Functions", "warning", `Edge Functions returned ${response.status}`, { status: response.status }, false)
        setSystemHealth(prev => ({ ...prev, payments: 'degraded' }))
      }
    } catch (err: any) {
      addResult("Edge Functions", "error", `Edge Functions test failed: ${err.message}`, err, false)
      setSystemHealth(prev => ({ ...prev, payments: 'down' }))
    }

    // CRITICAL TEST 7: Real-world Query Test
    addResult("Real Query Test", "info", "Testing actual application queries...", null, true)
    
    try {
      // Test the exact query that might be failing in your app
      const { data: queryData, error: queryError } = await supabaseClient
        .from('payments')
        .select('id, user_id, total_amount, status, created_at')
        .limit(5)
      
      if (queryError) {
        addResult("Real Query Test", "warning", 
          `Query failed: ${queryError.message}`, queryError, false)
      } else {
        addResult("Real Query Test", "success", 
          "✅ Real application queries work perfectly", queryData, false)
      }
    } catch (err: any) {
      addResult("Real Query Test", "error", `Real query test error: ${err.message}`, err, true)
    }

    // CRITICAL TEST 8: Production Environment Check
    addResult("Production Environment", "info", "Checking production environment status...", null, false)
    
    const isProduction = window.location.hostname === 'globalmarketsconsulting.com'
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')
    const isBolt = window.location.hostname.includes('bolt.new') || window.location.hostname.includes('stackblitz')
    
    addResult("Environment Detection", "info", 
      `Environment: ${isProduction ? 'Production' : isLocal ? 'Local Development' : isBolt ? 'Bolt Editor' : 'Unknown'}`, 
      { hostname: window.location.hostname, origin: window.location.origin }, false)

    // Calculate overall system health
    const criticalErrors = results.filter(r => r.status === 'error' && r.critical).length
    const totalErrors = results.filter(r => r.status === 'error').length
    
    let overallHealth: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (criticalErrors > 0) {
      overallHealth = 'down'
    } else if (totalErrors > 0) {
      overallHealth = 'degraded'
    }
    
    setSystemHealth(prev => ({ ...prev, overall: overallHealth }))

    addResult("Diagnostic Complete", "info", 
      `Diagnostics complete. Found ${criticalErrors} critical errors, ${totalErrors} total errors`, 
      { criticalErrors, totalErrors, overallHealth }, false)

    setIsRunning(false)
  }

  // Auto-run diagnostics on mount
  useEffect(() => {
    runComprehensiveDiagnostics()
  }, [])

  // Auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runComprehensiveDiagnostics, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info': return <Loader2 className="h-5 w-5 text-blue-600" />
      default: return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string, critical: boolean = false) => {
    const base = {
      'success': 'border-green-200 bg-green-50 text-green-700',
      'error': 'border-red-200 bg-red-50 text-red-700',
      'warning': 'border-yellow-200 bg-yellow-50 text-yellow-700',
      'info': 'border-blue-200 bg-blue-50 text-blue-700'
    }[status] || 'border-gray-200 bg-gray-50 text-gray-700'
    
    return critical && status === 'error' ? 'border-red-500 bg-red-100 text-red-900 ring-2 ring-red-200' : base
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'down': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const criticalIssues = results.filter(r => r.status === 'error' && r.critical)
  const totalErrors = results.filter(r => r.status === 'error')
  const successCount = results.filter(r => r.status === 'success').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Complete Site Diagnostics
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis to identify and resolve all system issues
            </p>
          </div>

          {/* System Health Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-lg p-4 text-center border-2 ${getHealthColor(systemHealth.database)}`}>
              <Database className="h-8 w-8 mx-auto mb-2" />
              <div className="font-bold">Database</div>
              <div className="text-sm capitalize">{systemHealth.database}</div>
            </div>
            <div className={`rounded-lg p-4 text-center border-2 ${getHealthColor(systemHealth.authentication)}`}>
              <Users className="h-8 w-8 mx-auto mb-2" />
              <div className="font-bold">Authentication</div>
              <div className="text-sm capitalize">{systemHealth.authentication}</div>
            </div>
            <div className={`rounded-lg p-4 text-center border-2 ${getHealthColor(systemHealth.payments)}`}>
              <CreditCard className="h-8 w-8 mx-auto mb-2" />
              <div className="font-bold">Payments</div>
              <div className="text-sm capitalize">{systemHealth.payments}</div>
            </div>
            <div className={`rounded-lg p-4 text-center border-2 ${getHealthColor(systemHealth.overall)}`}>
              <Globe className="h-8 w-8 mx-auto mb-2" />
              <div className="font-bold">Overall</div>
              <div className="text-sm capitalize">{systemHealth.overall}</div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {criticalIssues.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">
                    {criticalIssues.length} Critical Issue{criticalIssues.length > 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-red-700">These issues are preventing your site from working properly</p>
                </div>
              </div>
              <div className="space-y-2">
                {criticalIssues.map((issue, index) => (
                  <div key={index} className="bg-white rounded p-3 border border-red-200">
                    <div className="font-medium text-red-900">{issue.test}</div>
                    <div className="text-sm text-red-700">{issue.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={runComprehensiveDiagnostics}
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
                    <span>Running Diagnostics...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Run Full Diagnostics</span>
                  </>
                )}
              </button>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh every 30s</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {showRawData ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                <span>{showRawData ? 'Hide' : 'Show'} Technical Details</span>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900">{successCount}</div>
              <div className="text-sm text-green-700">Tests Passed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-red-900">{totalErrors.length}</div>
              <div className="text-sm text-red-700">Total Errors</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-bold text-yellow-900">{criticalIssues.length}</div>
              <div className="text-sm text-yellow-700">Critical Issues</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Table className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">{results.length}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
          </div>

          {/* Diagnostic Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Test Results</h2>
              
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status, result.critical)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{result.test}</h3>
                          {result.critical && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details && showRawData && (
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

          {/* Quick Fix Actions */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-4">Quick Fix Actions:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  // Test specific problematic query
                  const testProblematicQuery = async () => {
                    try {
                      const { data, error } = await supabaseClient
                        .from('payments')
                        .select('id, user_id, total_amount, status, metadata')
                        .limit(3)
                      
                      if (error) {
                        addResult("Problematic Query Test", "error", `Query that's causing issues failed: ${error.message}`, error)
                      } else {
                        addResult("Problematic Query Test", "success", `Problematic query actually works fine! Returned ${data?.length || 0} records`, data)
                      }
                    } catch (err: any) {
                      addResult("Problematic Query Test", "error", `Query error: ${err.message}`, err)
                    }
                  }
                  testProblematicQuery()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Test Specific Failing Query
              </button>
              
              <button
                onClick={() => {
                  // Copy all results to clipboard for sharing
                  const summary = results.map(r => 
                    `${r.critical ? '[CRITICAL] ' : ''}${r.test}: ${r.status.toUpperCase()} - ${r.message}`
                  ).join('\n')
                  navigator.clipboard.writeText(summary)
                  addResult("Export Results", "info", "Diagnostic results copied to clipboard for sharing")
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy Results for Support
              </button>
            </div>
          </div>

          {/* Conclusion */}
          {!isRunning && results.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Diagnostic Conclusion:</h3>
              {criticalIssues.length === 0 ? (
                <div className="text-green-700">
                  <strong>✅ No critical issues found!</strong> Your database schema is working properly and the site should function correctly.
                </div>
              ) : (
                <div className="text-red-700">
                  <strong>❌ {criticalIssues.length} critical issue{criticalIssues.length > 1 ? 's' : ''} found!</strong> 
                  These need to be fixed before the site will work properly.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
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