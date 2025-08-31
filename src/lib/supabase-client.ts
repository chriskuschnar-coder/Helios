import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Environment Variables Check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING ❌')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present ✅' : 'MISSING ❌')
console.log('Current Origin:', window.location.origin)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing environment variables!')
  console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.error('Check your .env file in the project root')
}

// Create Supabase client with minimal configuration for testing
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    }
  }
})

// Simple connection test
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('Target URL:', supabaseUrl)
    console.log('Origin:', window.location.origin)
    
    // Try a simple health check first
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Raw fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText)
      return false
    }
    
    // Now try a Supabase client query
    const { data, error } = await supabaseClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err)
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    })
    return false
  }
}

console.log('📦 Supabase client module loaded')