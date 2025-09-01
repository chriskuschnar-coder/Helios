import { createClient } from '@supabase/supabase-js'

// Get environment variables - these should be set in .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl)
console.log('Key Present:', supabaseAnonKey ? 'Yes ✅' : 'No ❌')
console.log('Key Preview:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'None')
console.log('Current Origin:', window.location.origin)

// Ensure URL is HTTPS for WebContainer environments
const httpsUrl = supabaseUrl.replace('http://', 'https://')

// Create Supabase client with enhanced configuration for WebContainer
export const supabaseClient = createClient(httpsUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL detection in WebContainer
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
        } catch {
          // Ignore storage errors
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore storage errors
        }
      }
    }
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    },
    fetch: (url, options = {}) => {
      // Enhanced fetch with better error handling
      console.log('🌐 Making request to:', url)
      
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      }).catch(error => {
        console.error('❌ Fetch error:', error)
        throw new Error(`Network request failed: ${error.message}`)
      })
    }
  },
  db: {
    schema: 'public'
  }
})

// Enhanced connection test with detailed logging
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('Target URL:', httpsUrl)
    console.log('Origin:', window.location.origin)
    
    // Test with a simple query
    const { data, error, count } = await supabaseClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log('Query result:', { data, count })
    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err)
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message)
    return false
  }
}

// Test connection immediately when module loads
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase client initialized successfully')
  } else {
    console.error('❌ Supabase client initialization failed')
  }
})

console.log('📦 Supabase client module loaded')