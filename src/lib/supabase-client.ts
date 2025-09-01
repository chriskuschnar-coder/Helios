import { createClient } from '@supabase/supabase-js'

// Get environment variables with detailed logging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 SUPABASE CLIENT - Environment Check:')
console.log('🔍 VITE_SUPABASE_URL:', supabaseUrl)
console.log('🔍 VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey)
console.log('🔍 Key length:', supabaseAnonKey?.length || 0)

// Check if we're missing environment variables
const hasValidConfig = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') && 
  supabaseAnonKey.length > 100

console.log('🔍 Has valid Supabase config:', hasValidConfig)

// Create the Supabase client with fallback values
export const supabaseClient = createClient(
  supabaseUrl || 'https://upevugqarcvxnekzddeh.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

console.log('✅ Supabase client created')

// Test the connection immediately
supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error)
  } else {
    console.log('✅ Supabase connection test successful')
  }
}).catch(err => {
  console.error('❌ Supabase connection test error:', err)
})

export default supabaseClient