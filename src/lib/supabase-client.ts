import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for WebContainer
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}


console.log('🔧 Supabase client configuration:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
})

// Create Supabase client with proper configuration
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keep user logged in across browser sessions
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Handle auth redirects
    flowType: 'pkce', // Use PKCE flow for better security
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'hedge-fund-platform'
    }
  }
})

// Test connection on initialization
supabaseClient.from('users').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection test successful')
    }
  })
  .catch(err => {
    console.warn('⚠️ Supabase connection test error:', err)
  })