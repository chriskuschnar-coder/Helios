import React, { useState, useEffect } from 'react'
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye, Code, Table } from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: any
  timestamp: string
}

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

export function DatabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [tableSchema, setTableSchema] = useState<TableInfo[]>([])
  const [showRawData, setShowRawData] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details?: any) => {
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
    setTableSchema([])

    addResult("Database Diagnostics", "info", "Starting comprehensive database diagnostics...")

    // Test 1: Basic Connection
    addResult("Connection Test", "info", "Testing Supabase connection...")
    try {
      const { data, error } = await supabaseClient.from('users').select('count').limit(1)
      
      if (error) {
        addResult("Connection Test", "error", `Connection failed: ${error.message}`, error)
        setIsRunning(false)
        return
      } else {
        addResult("Connection Test", "success", "Database connection successful", data)
      }
    } catch (err) {
      addResult("Connection Test", "error", `Network error: ${err.message}`)
      setIsRunning(false)
      return
    }

    // Test 2: Check Payments Table Exists
    addResult("Payments Table", "info", "Checking if payments table exists...")
    try {
      const { data, error } = await supabaseClient.from('payments').select('count').limit(1)
      
      if (error) {
        addResult("Payments Table", "error", `Payments table error: ${error.message}`, error)
      } else {
        addResult("Payments Table", "success", "Payments table accessible", data)
      }
    } catch (err) {
      addResult("Payments Table", "error", `Payments table access failed: ${err.message}`)
    }

    // Test 3: Get Payments Table Schema
    addResult("Schema Analysis", "info", "Analyzing payments table schema...")
    try {
      const { data: schemaData, error: schemaError } = await supabaseClient
        .rpc('get_table_schema', { table_name: 'payments' })
        .select('*')

      if (schemaError) {
        // Fallback: Use information_schema query
        const { data: fallbackSchema, error: fallbackError } = await supabaseClient
          .from('information_schema.columns')
          .select('table_name, column_name, data_type, is_nullable, column_default')
          .eq('table_name', 'payments')
          .order('ordinal_position')

        if (fallbackError) {
          addResult("Schema Analysis", "error", `Schema query failed: ${fallbackError.message}`, fallbackError)
        } else {
          setTableSchema(fallbackSchema || [])
          addResult("Schema Analysis", "success", `Found ${fallbackSchema?.length || 0} columns in payments table`, fallbackSchema)
        }
      } else {
        setTableSchema(schemaData || [])
        addResult("Schema Analysis", "success", `Schema retrieved successfully`, schemaData)
      }
    } catch (err) {
      addResult("Schema Analysis", "error", `Schema analysis failed: ${err.message}`)
    }

    // Test 4: Specifically Check for transaction_hash Column
    addResult("Database Schema", "info", "Checking database schema...")
    try {
      const { data: schemaData, error: schemaError } = await supabaseClient
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'payments')
        .order('ordinal_position')

      if (schemaError) {
        addResult("Database Schema", "error", `Schema check failed: ${schemaError.message}`)
      } else {
        addResult("Database Schema", "success", `Found ${schemaData?.length || 0} columns in payments table`)
      }
    } catch (err) {
      addResult("Database Schema", "error", `Schema check error: ${err.message}`)
    }
    // Test 5: Test Insert with transaction_hash
    addResult("Insert Test", "info", "Testing insert with transaction_hash column...")
    try {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        product_id: 'test_product',
        quantity: 1,
        total_amount: 100.00,
        status: 'test',
        metadata: { test: true }
      }

      const { data: insertData, error: insertError } = await supabaseClient
        .from('payments')
        .select('id, user_id, total_amount, status, created_at')
        .select()

      if (insertError) {
        addResult("Insert Test", "error", `Insert failed: ${insertError.message}`, {
          error: insertError,
          attempted_data: testData
        })
      } else {
        addResult("Insert Test", "success", "Insert successful!", insertData)
        addResult("Application Query Test", "warning", `Query failed: ${queryError.message}`)
      }
    } catch (err) {
      addResult("Insert Test", "error", `Insert test error: ${err.message}`)
    }

    // Test 6: Check All Tables for Reference
    addResult("All Tables Check", "info", "Checking all available tables...")
    try {
      const { data: tablesData, error: tablesError } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name')

      if (tablesError) {
        addResult("All Tables Check", "error", `Tables query failed: ${tablesError.message}`, tablesError)
      } else {
        addResult("All Tables Check", "success", `Found ${tablesData?.length || 0} tables`, tablesData)
      }
    } catch (err) {
      addResult("All Tables Check", "error", `Tables check error: ${err.message}`)
    }

    // Test 7: Check Recent Migrations
    addResult("Migrations Check", "info", "Checking recent database migrations...")
    try {
      // This might not work if migrations table doesn't exist, but worth trying
      const { data: migrationsData, error: migrationsError } = await supabaseClient
        .from('supabase_migrations.schema_migrations')
        .select('version, inserted_at')
        .order('inserted_at', { ascending: false })
        .limit(10)

      if (migrationsError) {
        addResult("Migrations Check", "warning", "Could not access migrations table (this is normal)", migrationsError)
      } else {
        addResult("Migrations Check", "success", `Found ${migrationsData?.length || 0} recent migrations`, migrationsData)
      }
    } catch (err) {
      addResult("Migrations Check", "warning", "Migrations check skipped (table may not be accessible)")
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info': return <Loader2 className="h-5 w-5 text-blue-600" />
      default: return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50 text-green-700'
      case 'error': return 'border-red-200 bg-red-50 text-red-700'
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-700'
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-700'
      default: return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  // Auto-run on mount
  useEffect(() => {
    runDiagnostics()
  }, [])

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Database Diagnostic Tool
            </h1>
            <p className="text-gray-600">
              Comprehensive analysis to identify database issues and verify schema integrity
            </p>
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
              <div className="font-bold text-red-900">{errorCount}</div>
              <div className="text-sm text-red-700">Errors Found</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-bold text-yellow-900">{warningCount}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Table className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">{tableSchema.length}</div>
              <div className="text-sm text-blue-700">Columns Found</div>
            </div>
          </div>

          {/* Controls */}
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
                  <span>Running Diagnostics...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>Run Full Diagnostics</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {showRawData ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                <span>{showRawData ? 'Hide' : 'Show'} Raw Data</span>
              </button>
            </div>
          </div>

          {/* Payments Table Schema */}
          {tableSchema.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments Table Schema</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Column Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Data Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nullable</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tableSchema.map((column, index) => (
                      <tr key={index} className={column.column_name === 'transaction_hash' ? 'bg-green-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {column.column_name}
                          {column.column_name === 'transaction_hash' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              TARGET COLUMN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{column.data_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{column.is_nullable}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {column.column_default || 'NULL'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Transaction Hash Status */}
              <div className="mt-4">
                {tableSchema.some(col => col.column_name === 'transaction_hash') ? (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      ✅ transaction_hash column EXISTS and is properly configured
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">
                      ❌ transaction_hash column is MISSING from payments table
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnostic Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Results</h2>
              
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-medium">{result.test}</h3>
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

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Quick Actions:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  // Test a specific query that might be failing
                  const testQuery = async () => {
                    try {
                      const { data, error } = await supabaseClient
                        .from('payments')
                        .select('id, user_id, total_amount, status, transaction_hash')
                        .limit(5)
                      
                      if (error) {
                        addResult("Live Query Test", "error", `Query failed: ${error.message}`, error)
                      } else {
                        addResult("Live Query Test", "success", `Query successful, returned ${data?.length || 0} records`, data)
                      }
                    } catch (err) {
                      addResult("Live Query Test", "error", `Query error: ${err.message}`)
                    }
                  }
                  testQuery()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Test Live Query with transaction_hash
              </button>
              
              <button
                onClick={() => {
                  // Copy diagnostic results to clipboard
                  const summary = results.map(r => `${r.test}: ${r.status} - ${r.message}`).join('\n')
                  navigator.clipboard.writeText(summary)
                  addResult("Copy Results", "info", "Diagnostic results copied to clipboard")
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy Results to Clipboard
              </button>
            </div>
          </div>

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