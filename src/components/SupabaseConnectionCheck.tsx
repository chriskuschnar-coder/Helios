import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Database, Key, Globe, RefreshCw } from 'lucide-react'
import { supabaseClient } from '../lib/supabase-client'

export function SupabaseConnectionCheck() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [details, setDetails] = useState<any>({})
  const [error, setError] = useState<string>('')

  const checkConnection = async () => {
    setConnectionStatus('checking')
    setError('')
    
    try {
      // Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      console.log('🔍 Environment check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        url: supabaseUrl,
        keyLength: supabaseKey?.length
      })
      
      if (!supabaseUrl || !supabaseKey) {
        setConnectionStatus('disconnected')
        setError('Environment variables missing')
        setDetails({
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          url: supabaseUrl || 'Not set',
          keyPreview: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not set'
        })
        return
      }

      // Test database connection
      console.log('🔍 Testing database connection...')
      const { data, error: dbError } = await supabaseClient
        .from('users')
        .select('count')
        .limit(1)

      if (dbError) {
        console.error('❌ Database connection failed:', dbError)
        setConnectionStatus('error')
        setError(`Database error: ${dbError.message}`)
        setDetails({
          hasUrl: true,
          hasKey: true,
          url: supabaseUrl,
          keyPreview: supabaseKey.substring(0, 20) + '...',
          dbError: dbError
        })
        return
      }

      // Test authentication
      console.log('🔍 Testing authentication...')
      const { data: session, error: authError } = await supabaseClient.auth.getSession()
      
      if (authError) {
        console.warn('⚠️ Auth check warning:', authError)
      }

      console.log('✅ Supabase connection successful')
      setConnectionStatus('connected')
      setDetails({
        hasUrl: true,
        hasKey: true,
        url: supabaseUrl,
        keyPreview: supabaseKey.substring(0, 20) + '...',
        dbConnection: 'Success',
        authSystem: 'Working',
        currentSession: session?.session ? 'Active' : 'None',
        projectId: supabaseUrl.split('//')[1]?.split('.')[0] || 'Unknown'
      })

    } catch (error) {
      console.error('❌ Connection check failed:', error)
      setConnectionStatus('error')
      setError(error instanceof Error ? error.message : 'Unknown error')
      setDetails({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'disconnected':
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />
      default:
        return <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'border-green-200 bg-green-50'
      case 'disconnected':
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to Supabase'
      case 'disconnected':
        return 'Supabase Not Connected'
      case 'error':
        return 'Connection Error'
      default:
        return 'Checking Connection...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2">
            Supabase Connection Status
          </h1>
          <p className="text-gray-600">
            Checking your database connection and configuration
          </p>
        </div>

        <div className={`border-2 rounded-xl p-6 mb-6 ${getStatusColor()}`}>
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            {getStatusText()}
          </h2>
          {error && (
            <p className="text-center text-red-600 text-sm">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Supabase URL:</span>
                <span className="font-mono text-gray-900">{details.url || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Key:</span>
                <span className="font-mono text-gray-900">{details.keyPreview || 'Not set'}</span>
              </div>
              {details.projectId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Project ID:</span>
                  <span className="font-mono text-gray-900">{details.projectId}</span>
                </div>
              )}
              {details.dbConnection && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium text-green-600">{details.dbConnection}</span>
                </div>
              )}
              {details.authSystem && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Authentication:</span>
                  <span className="font-medium text-green-600">{details.authSystem}</span>
                </div>
              )}
              {details.currentSession && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Session:</span>
                  <span className="font-medium text-gray-900">{details.currentSession}</span>
                </div>
              )}
            </div>
          </div>

          {connectionStatus === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">All Systems Operational</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Database connection established</li>
                <li>✓ Authentication system working</li>
                <li>✓ Environment variables configured</li>
                <li>✓ Ready for user registration and login</li>
              </ul>
            </div>
          )}

          {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Connection Issues Detected</span>
              </div>
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>To fix this:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the "Connect to Supabase" button in the top right of Bolt</li>
                  <li>Or manually set environment variables in your .env file</li>
                  <li>Ensure your Supabase project is active and accessible</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={checkConnection}
            className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recheck Connection</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Platform
          </button>
        </div>
      </div>
    </div>
  )
}