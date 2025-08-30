import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('🔍 Supabase Environment Check:')
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Loaded ✅' : 'Missing ❌')
console.log('Current Origin:', window.location.origin)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables - using fallback')
  // Create a mock client for deployment
  export const supabase = {
    from: () => ({
      select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
  export const testConnection = () => Promise.resolve({ data: null, error: null })
} else {
  // Create Supabase client
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  })

  // Test connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .limit(1)
      
      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  export { testConnection }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

// Test connection immediately
console.log('🔍 Testing Supabase connection...')

// Simple connection test
const testConnection = async () => {
  try {
    console.log('🔍 Attempting to query users table...')
    
    // Test 1: Simple table query
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase query failed:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Check for specific error types
      if (error.message?.includes('fetch')) {
        console.error('🚨 This appears to be a network/CORS issue')
        console.error('WebContainer origin may not be supported by Supabase')
      } else if (error.message?.includes('JWT')) {
        console.error('🚨 This appears to be an authentication key issue')
      } else if (error.message?.includes('permission')) {
        console.error('🚨 This appears to be a Row Level Security issue')
      }
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('Query result:', data)
    }

    // Test 2: Auth status
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('❌ Auth session error:', authError)
    } else {
      console.log('✅ Auth system working:', authData.session ? 'User logged in' : 'No active session')
    }

    return { data, error }
  } catch (err) {
    console.error('❌ Unexpected error during connection test:', err)
    
    // Detailed error analysis
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error('🚨 Network Error - likely CORS or WebContainer restriction')
      console.error('Consider using Edge Functions or testing locally')
    } else {
      console.error('🚨 Unknown error type:', typeof err)
    }
    
    return { data: null, error: err }
  }
}

// Run test immediately
testConnection()

export { testConnection }