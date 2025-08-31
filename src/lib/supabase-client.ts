import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl ? 'Configured ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Configured ✅' : 'Missing ❌')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not configured')
  throw new Error('Supabase configuration missing')
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

console.log('✅ Supabase client initialized successfully')