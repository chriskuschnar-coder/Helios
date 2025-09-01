import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [envVars, setEnvVars] = useState({
    url: '',
    key: ''
  })

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'
    })

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        if (error) {
          setConnectionStatus(`Error: ${error.message}`)
        } else {
          setConnectionStatus('✅ Connected successfully!')
        }
      } catch (err) {
        setConnectionStatus(`Connection failed: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Environment Variables:</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div>VITE_SUPABASE_URL: <span className="font-mono">{envVars.url}</span></div>
              <div>VITE_SUPABASE_ANON_KEY: <span className="font-mono">{envVars.key}</span></div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700">Connection Status:</h3>
            <div className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
              {connectionStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}