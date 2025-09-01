import { createClient } from '@supabase/supabase-js'

console.log('🔍 supabase-client.ts loading...')

// Environment variables with fallbacks for WebContainer
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'

console.log('🔍 Supabase config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
})

// Create Supabase client with proper configuration
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'hedge-fund-platform'
    }
  }
})

console.log('✅ Supabase client created successfully')

// Test connection on load
supabaseClient.from('users').select('count').limit(1)
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