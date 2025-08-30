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
  const [showPlatform, setShowPlatform] = useState(true)
  
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
            setConnectionStatus('❌ WebContainer Network Restriction (Expected)')
            setConnectionDetails({
              issue: 'WebContainer Network Limitation',
              solution: 'WebContainer cannot reach external Edge Functions',
              recommendation: 'Download project and run on localhost:5173 for full functionality',
              note: 'Demo mode works perfectly in WebContainer!'
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

  // Always show the platform - it handles auth states internally
  return (
    <AuthProvider>
      <InvestmentPlatform />
    </AuthProvider>
  )
}

export default App