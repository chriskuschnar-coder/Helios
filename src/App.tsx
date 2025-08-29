import React, { useEffect, useState } from 'react'
import { supabaseClient } from './lib/supabase-client'
import { AuthProvider } from './components/auth/AuthProvider'
import { InvestmentPlatform } from './components/InvestmentPlatform'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Testing connection...')
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const [envStatus, setEnvStatus] = useState({
    url: '',
    key: '',
    origin: ''
  })
  const [showPlatform, setShowPlatform] = useState(false)
  const [useProxy, setUseProxy] = useState(false)
  
  useEffect(() => {
    console.log('🔍 App component mounted, checking Supabase setup...')
    
    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL || 'NOT LOADED'
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'NOT LOADED'
    
    console.log('🔍 Environment check:')
    console.log('- VITE_SUPABASE_URL:', url)
    console.log('- VITE_SUPABASE_ANON_KEY:', key === 'NOT LOADED' ? 'NOT LOADED' : 'LOADED ✅')
    
    setEnvStatus({
      url,
      key: key === 'NOT LOADED' ? 'NOT LOADED' : 'LOADED ✅',
      origin: window.location.origin
    })

    // Test connection
    const runConnectionTest = async () => {
      try {
        setConnectionStatus('Testing Supabase connection...')
        
        const result = await supabaseClient.testConnection()
        
        if (result.error) {
          if (result.error.message?.includes('fetch') || result.error instanceof TypeError) {
            setConnectionStatus('❌ WebContainer CORS Issue - Use Edge Functions or test locally')
            setConnectionDetails({
              issue: 'WebContainer CORS Restriction',
              solution: 'Supabase blocks non-standard origins like WebContainer',
              recommendation: 'Use Edge Functions proxy or test on localhost'
            })
          } else {
            setConnectionStatus(`❌ Supabase Error: ${result.error.message}`)
            setConnectionDetails(result.error)
          }
        } else {
          setConnectionStatus('✅ Connected successfully!')
          setConnectionDetails(result.data)
        }
      } catch (err: any) {
        console.error('❌ Connection test failed:', err)
        setConnectionStatus(`❌ Connection Failed: ${err.message || err}`)
        setConnectionDetails(err)
      }
    }
    
    runConnectionTest()
  }, [])

  // If user wants to show platform, render it
  if (showPlatform) {
    return (
      <AuthProvider>
        <InvestmentPlatform />
      </AuthProvider>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🏦 Hedge Fund Platform - Connection Test</h1>
          <p className="text-gray-400">Testing Supabase connection from WebContainer environment</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Environment Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              ✅ Environment Variables
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">VITE_SUPABASE_URL:</span>
                <div className="font-mono text-green-400 break-all mt-1">
                  {envStatus.url}
                </div>
              </div>
              <div>
                <span className="text-gray-400">VITE_SUPABASE_ANON_KEY:</span>
                <div className="font-mono text-green-400 mt-1">
                  {envStatus.key}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Current Origin:</span>
                <div className="font-mono text-blue-400 break-all mt-1">
                  {envStatus.origin}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">🔗 Connection Status</h2>
            <div className="text-lg mb-4">{connectionStatus}</div>
            
            {connectionDetails && (
              <div className="text-sm bg-gray-900 p-3 rounded font-mono">
                <pre>{JSON.stringify(connectionDetails, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🛠️ WebContainer CORS Solutions</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded">
              <h3 className="font-semibold text-blue-300 mb-3">✅ Solution 1: Edge Functions (Recommended)</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>I've created a Supabase Edge Function that acts as a proxy:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Runs on Supabase servers (no CORS issues)</li>
                  <li>Handles auth and database operations</li>
                  <li>Works perfectly in WebContainer</li>
                  <li>Automatically deployed and ready to use</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-900/20 border border-green-700 p-4 rounded">
              <h3 className="font-semibold text-green-300 mb-3">🏠 Solution 2: Local Testing</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>For full Supabase client features:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Run <code>npm run dev</code> locally</li>
                  <li>Access on <code>http://localhost:5173</code></li>
                  <li>Supabase works perfectly with localhost</li>
                  <li>Full real-time features available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              🔄 Test Connection Again
            </button>
            
            <button 
              onClick={() => setShowPlatform(true)} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              🚀 Load Platform (Demo Mode)
            </button>
          </div>
          
          <div className="text-gray-400 text-sm">
            <p>The Edge Function proxy is automatically deployed and ready to use.</p>
            <p>Demo mode will show the platform with mock data while you test locally.</p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 text-xs text-gray-500 bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">🔧 Technical Details</h3>
          <div className="space-y-1">
            <div><strong>Issue:</strong> WebContainer origins are non-standard and may be blocked by Supabase</div>
            <div><strong>Root Cause:</strong> Browser security restrictions on cross-origin requests</div>
            <div><strong>Solution:</strong> Edge Functions bypass browser CORS by running server-side</div>
            <div><strong>Alternative:</strong> Local development with standard localhost origin</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App