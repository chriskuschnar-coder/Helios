import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 SUPABASE CLIENT - Environment Variables:')
console.log('🔍 VITE_SUPABASE_URL:', supabaseUrl)
console.log('🔍 VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey)

// Validate we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ CRITICAL: Missing Supabase environment variables')
  console.warn('⚠️ URL:', supabaseUrl)
  console.warn('⚠️ Key present:', !!supabaseAnonKey)
}

// Create the Supabase client with proper syntax - FIX THE SYNTAX ERROR HERE
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

console.log('✅ Supabase client created successfully')

export default supabaseClient