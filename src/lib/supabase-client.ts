import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 DETAILED Environment Variables Check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length || 0)
console.log('VITE_SUPABASE_ANON_KEY preview:', supabaseAnonKey?.substring(0, 50) + '...')
console.log('Current Origin:', window.location.origin)

// Test direct fetch to Supabase
console.log('🌐 Testing direct fetch to Supabase...')
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: { 
    "apikey": supabaseAnonKey,
    "Authorization": `Bearer ${supabaseAnonKey}`
  }
})
.then(res => {
  console.log('✅ Direct fetch successful:', res.status, res.statusText)
  return res.text()
})
.then(text => console.log('📄 Response:', text.substring(0, 200)))
.catch(err => {
  console.error('❌ Direct fetch failed:', err)
  console.error('This confirms WebContainer is blocking external requests')
})

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl ? 'Configured ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Configured ✅' : 'Missing ❌')

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Supabase URL not configured')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ Supabase Anon Key not configured')
  console.error('Check your .env file in the project root')
}

// Create Supabase client with minimal configuration for testing
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    }
  }
})

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 DETAILED Testing Supabase connection...')
    console.log('Target URL:', supabaseUrl)
    console.log('Anon Key (first 50 chars):', supabaseAnonKey?.substring(0, 50))
    console.log('Origin:', window.location.origin)
    
    // Try a simple health check first
    const testUrl = `${supabaseUrl}/rest/v1/`
    console.log('🌐 Fetching:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Response received:', response.status, response.statusText)
    console.log('📡 Raw fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('❌ Response body:', responseText)
      if (response.status === 400) {
        console.error('❌ This usually means invalid API key or CORS issue')
      }
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