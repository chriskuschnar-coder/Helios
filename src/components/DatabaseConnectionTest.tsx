import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Database, RefreshCw, Shield } from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export function DatabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'issues' | 'critical'>('healthy')

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const runComprehensiveTests = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables
    addResult("Environment Variables", "info", "Checking configuration...")
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      addResult("Environment Variables", "error", "Missing Supabase configuration")
      setOverallStatus('critical')
    } else {
      addResult("Environment Variables", "success", "Supabase configuration found")
    }

    // Test 2: Database Connection
    addResult("Database Connection", "info", "Testing Supabase connection...")
    
    try {
      const { data, error } = await supabaseClient.from('users').select('count').limit(1)
      
      if (error) {
        addResult("Database Connection", "error", `Connection failed: ${error.message}`)
        setOverallStatus('critical')
        setIsRunning(false)
        return
      } else {
        addResult("Database Connection", "success", "Database connection successful")
      }
    } catch (err: any) {
      addResult("Database Connection", "error", `Network error: ${err.message}`)
      setOverallStatus('critical')
      setIsRunning(false)
      return
    }

    // Test 3: Payments Table Schema
    addResult("Payments Table Schema", "info", "Checking payments table structure...")
    
    try {
      const { data: schemaData, error: schemaError } = await supabaseClient
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'payments')
        .eq('table_schema', 'public')
        .order('ordinal_position')

      if (schemaError) {
        addResult("Payments Table Schema", "error", `Schema query failed: ${schemaError.message}`)
        setOverallStatus('issues')
      } else {
        addResult("Payments Table Schema", "success", `Found ${schemaData?.length || 0} columns`)
        
        // Check specifically for transaction_hash
        const hasTransactionHash = schemaData?.some(col => col.column_name === 'transaction_hash')
        if (hasTransactionHash) {
          addResult("Transaction Hash Column", "success", "✅ transaction_hash column EXISTS and is accessible")
        } else {
          addResult("Transaction Hash Column", "error", "❌ transaction_hash column NOT FOUND")
          setOverallStatus('critical')
        }
      }
    } catch (err: any) {
      addResult("Payments Table Schema", "error", `Schema check failed: ${err.message}`)
      setOverallStatus('issues')
    }

    // Test 4: Real Application Query Test
    addResult("Application Query Test", "info", "Testing actual application queries...")
    
    try {
      const { data: queryData, error: queryError } = await supabaseClient
        .from('payments')
        .select('id, user_id, total_amount, status, transaction_hash, created_at')
        .limit(3)
      
      if (queryError) {
        if (queryError.message.includes('transaction_hash')) {
          addResult("Application Query Test", "error", "❌ CONFIRMED: Application queries failing due to transaction_hash")
          setOverallStatus('critical')
        } else {
          addResult("Application Query Test", "warning", `Query failed for different reason: ${queryError.message}`)
        }
      } else {
        addResult("Application Query Test", "success", "✅ Application queries work perfectly")
      }
    } catch (err: any) {
      addResult("Application Query Test", "error", `Query test failed: ${err.message}`)
      setOverallStatus('issues')
    }

    // Test 5: Insert Test with transaction_hash
    addResult("Insert Test", "info", "Testing insert with transaction_hash...")
    
    try {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000',
        product_id: 'test_product',
        quantity: 1,
        total_amount: 100.00,
        status: 'test',
        transaction_hash: `test_hash_${Date.now()}`,
        metadata: { test: true }
      }

      const { data: insertData, error: insertError } = await supabaseClient
        .from('payments')
        .insert(testData)
        .select()

      if (insertError) {
        if (insertError.message.includes('transaction_hash')) {
          addResult("Insert Test", "error", "❌ Insert with transaction_hash FAILED - column issue confirmed")
          setOverallStatus('critical')
        } else {
          addResult("Insert Test", "warning", `Insert failed for other reason: ${insertError.message}`)
        }
      } else {
        addResult("Insert Test", "success", "✅ Insert with transaction_hash SUCCESSFUL")
        
        // Clean up test record
        if (insertData && insertData.length > 0) {
          await supabaseClient.from('payments').delete().eq('id', insertData[0].id)
          addResult("Cleanup", "success", "Test record cleaned up")
        }
      }
    } catch (err: any) {
      addResult("Insert Test", "error", `Insert test error: ${err.message}`)
      setOverallStatus('issues')
    }

    // Test 6: Authentication System
    addResult("Authentication Test", "info", "Testing authentication system...")
    
    try {
      const { data: session, error: authError } = await supabaseClient.auth.getSession()
      
      if (authError) {
        addResult("Authentication Test", "error", `Auth error: ${authError.message}`)
        setOverallStatus('issues')
      } else {
        addResult("Authentication Test", "success", "Authentication system working")
      }
    } catch (err: any) {
      addResult("Authentication Test", "error", `Auth test failed: ${err.message}`)
      setOverallStatus('issues')
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runComprehensiveTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default: return <Database className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50 text-green-700'
      case 'error': return 'border-red-200 bg-red-50 text-red-700'
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-700'
      default: return 'border-blue-200 bg-blue-50 text-blue-700'
    }
  }

  const criticalErrors = results.filter(r => r.status === 'error').length
  const successCount = results.filter(r => r.status === 'success').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Database Diagnostic Results
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis of your database connection and schema
            </p>
          </div>

          {/* Overall Status */}
          <div className={`p-6 rounded-lg border-2 mb-8 ${
            overallStatus === 'healthy' ? 'border-green-500 bg-green-50' :
            overallStatus === 'issues' ? 'border-yellow-500 bg-yellow-50' :
            'border-red-500 bg-red-50'
          }`}>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${
                overallStatus === 'healthy' ? 'text-green-900' :
                overallStatus === 'issues' ? 'text-yellow-900' :
                'text-red-900'
              }`}>
                {overallStatus === 'healthy' ? '✅ SYSTEM HEALTHY' :
                 overallStatus === 'issues' ? '⚠️ MINOR ISSUES DETECTED' :
                 '❌ CRITICAL ISSUES FOUND'}
              </div>
              <p className={`${
                overallStatus === 'healthy' ? 'text-green-700' :
                overallStatus === 'issues' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {overallStatus === 'healthy' ? 
                  'All systems operational. The transaction_hash error appears to be a false alarm.' :
                 overallStatus === 'issues' ? 
                  'Some non-critical issues detected. Site should still function.' :
                  'Critical issues found that need immediate attention.'}
              </p>
            </div>
          </div>

          {/* Test Results Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900">{successCount}</div>
              <div className="text-sm text-green-700">Tests Passed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-red-900">{criticalErrors}</div>
              <div className="text-sm text-red-700">Critical Errors</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">{results.length}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
          </div>

          {/* Detailed Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Test Results</h2>
              
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
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
                </div>
              ))}
            </div>
          )}

          {/* Conclusion and Next Steps */}
          {!isRunning && results.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Diagnostic Conclusion:</h3>
              {criticalErrors === 0 ? (
                <div className="text-green-700">
                  <strong>✅ No critical issues found!</strong> Your database schema is correct and the transaction_hash column exists. 
                  The error you were seeing appears to be a false alarm. Your site should be working properly.
                </div>
              ) : (
                <div className="text-red-700">
                  <strong>❌ {criticalErrors} critical issue{criticalErrors > 1 ? 's' : ''} found!</strong> 
                  These need to be fixed before the site will work properly.
                </div>
              )}
            </div>
          )}

          {/* Auto-refresh */}
          <div className="mt-6 text-center">
            <button
              onClick={runComprehensiveTests}
              disabled={isRunning}
              className="bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Re-run All Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}