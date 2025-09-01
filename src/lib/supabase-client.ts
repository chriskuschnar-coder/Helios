import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 SUPABASE CLIENT - Environment Variables:')
console.log('🔍 VITE_SUPABASE_URL:', supabaseUrl)
console.log('🔍 VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey)
console.log('🔍 VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length)
console.log('🔍 All env vars:', import.meta.env)

// Validate we have the required values
if (!supabaseUrl && !supabaseAnonKey) {
  console.warn('⚠️ CRITICAL: No Supabase environment variables found, using fallback values')
} else if (!supabaseUrl) {
  console.warn('⚠️ CRITICAL: Missing VITE_SUPABASE_URL')
} else if (!supabaseAnonKey) {
  console.warn('⚠️ CRITICAL: Missing VITE_SUPABASE_ANON_KEY')
} else {
  console.log('✅ Both Supabase environment variables found')
}

// Create the Supabase client
console.log('🔍 Creating Supabase client with URL:', supabaseUrl || 'fallback')
export const supabaseClient = createClient(
  supabaseUrl || 'https://upevugqarcvxnekzddeh.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)
console.log('✅ Supabase client created successfully:', !!supabaseClient)
console.log('🔍 Supabase client auth object:', !!supabaseClient?.auth)
console.log('🔍 Supabase client methods available:', Object.keys(supabaseClient))

// Also export as default for easier importing
export default supabaseClient