import { createClient } from '@supabase/supabase-js'

// Get environment variables - these will be available in production deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Environment Check:')
console.log('URL exists:', !!supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)

// Create Supabase client
export const supabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

console.log('✅ Supabase client created')