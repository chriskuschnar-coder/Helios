import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please click "Connect to Supabase" in Bolt to set up the database')
  throw new Error('Supabase not configured - click "Connect to Supabase" button')
}

console.log('✅ Supabase client initialized')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 Key configured:', supabaseAnonKey ? 'Yes' : 'No')

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'hedge-fund-platform'
    }
  }
})

// Test connection on initialization
supabase.from('users').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection test successful')
    }
  })
  .catch(err => {
    console.error('❌ Supabase connection error:', err)
  })