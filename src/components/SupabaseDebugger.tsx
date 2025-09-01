import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

export function SupabaseDebugger() {
  const [results, setResults] = useState<any>({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const testResults: any = {}

    // 1. Check environment variables
    console.log('🔍 Step 1: Environment Variables')
    testResults.env = {
      url: import.meta.env.VITE_SUPABASE_URL || null,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
      urlPresent: !!import.meta.env.VITE_SUPABASE_URL,
      keyPresent: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      origin: window.location.origin,
      href: window.location.href
    }

    // 2. Test raw fetch to Supabase
    console.log('🔍 Step 2: Raw Fetch Test')
    try {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        testResults.rawFetch = { error: 'Missing environment variables' }
      } else {
        const response = await fetch(`${url}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        })
        
        testResults.rawFetch = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        }
      }
    } catch (error: any) {
      testResults.rawFetch = { error: error.message, name: error.name }
    }

    // 3. Test Supabase client creation
    console.log('🔍 Step 3: Supabase Client Test')
    try {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        testResults.clientTest = { error: 'Cannot create client - missing credentials' }
      } else {
        const testClient = createClient(url, key)
        
        // Try a simple query
        const { data, error } = await testClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .limit(1)
        
        testResults.clientTest = { data, error: error?.message || null, success: !error }
      }
    } catch (error: any) {
      testResults.clientTest = { error: error.message, name: error.name }
    }

    // 4. Test specific table access
    console.log('🔍 Step 4: Table Access Test')
    try {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        testResults.tableTest = { error: 'Cannot test tables - missing credentials' }
      } else {
        const testClient = createClient(url, key)
        
        // Test each table
        const tables = ['users', 'accounts', 'transactions']
        const tableResults: any = {}
        
        for (const table of tables) {
          try {
            const { data, error } = await testClient
              .from(table)
              .select('*', { count: 'exact', head: true })
              .limit(1)
            
            tableResults[table] = { 
              accessible: !error, 
              error: error?.message || null,
              count: data?.length || 0
            }
          } catch (err: any) {
            tableResults[table] = { accessible: false, error: err.message }
          }
        }
        
        testResults.tableTest = tableResults
      }
    } catch (error: any) {
      testResults.tableTest = { error: error.message }
    }

    console.log('🔍 Complete test results:', testResults)
    setResults(testResults)
    setTesting(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    return success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Supabase Connection Debugger</h1>
              <p className="text-gray-600">Comprehensive connection testing and diagnostics</p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              <span>Retest</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Environment Variables */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(results.env?.urlPresent && results.env?.keyPresent)}
                <h3 className="text-lg font-semibold text-gray-900">Environment Variables</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700 mb-2">VITE_SUPABASE_URL</div>
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all">
                    {results.env?.url || 'NOT SET'}
                  </div>
                  <div className={`mt-1 text-xs ${results.env?.urlPresent ? 'text-green-600' : 'text-red-600'}`}>
                    {results.env?.urlPresent ? '✅ Present' : '❌ Missing'}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-700 mb-2">VITE_SUPABASE_ANON_KEY</div>
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                    {results.env?.key ? `${results.env.key.substring(0, 20)}...` : 'NOT SET'}
                  </div>
                  <div className={`mt-1 text-xs ${results.env?.keyPresent ? 'text-green-600' : 'text-red-600'}`}>
                    {results.env?.keyPresent ? '✅ Present' : '❌ Missing'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div><strong>Origin:</strong> {results.env?.origin}</div>
                  <div><strong>Full URL:</strong> {results.env?.href}</div>
                </div>
              </div>
            </div>

            {/* Raw Fetch Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(results.rawFetch?.ok)}
                <h3 className="text-lg font-semibold text-gray-900">Raw Fetch Test</h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(results.rawFetch, null, 2)}
                </pre>
              </div>
            </div>

            {/* Supabase Client Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(results.clientTest?.success)}
                <h3 className="text-lg font-semibold text-gray-900">Supabase Client Test</h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(results.clientTest, null, 2)}
                </pre>
              </div>
            </div>

            {/* Table Access Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(results.tableTest && Object.values(results.tableTest).some((t: any) => t.accessible))}
                <h3 className="text-lg font-semibold text-gray-900">Database Table Access</h3>
              </div>
              
              <div className="space-y-3">
                {results.tableTest && typeof results.tableTest === 'object' && !results.tableTest.error ? (
                  Object.entries(results.tableTest).map(([table, result]: [string, any]) => (
                    <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.accessible)}
                        <span className="font-medium">{table}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.accessible ? '✅ Accessible' : `❌ ${result.error}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(results.tableTest, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">🔧 Next Steps Based on Results:</h3>
            <div className="text-sm text-blue-800 space-y-2">
              {!results.env?.urlPresent && (
                <div>❌ <strong>Missing VITE_SUPABASE_URL</strong> - Add to .env file</div>
              )}
              {!results.env?.keyPresent && (
                <div>❌ <strong>Missing VITE_SUPABASE_ANON_KEY</strong> - Add to .env file</div>
              )}
              {results.rawFetch?.error && (
                <div>❌ <strong>Network Error:</strong> {results.rawFetch.error}</div>
              )}
              {results.clientTest?.error && (
                <div>❌ <strong>Client Error:</strong> {results.clientTest.error}</div>
              )}
              {results.env?.urlPresent && results.env?.keyPresent && results.rawFetch?.ok && results.clientTest?.success && (
                <div>✅ <strong>All tests passed!</strong> Connection should work</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}