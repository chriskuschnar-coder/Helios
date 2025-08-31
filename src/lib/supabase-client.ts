import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Configuration Check:')
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}... ✅` : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}... ✅` : 'Missing ❌')

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL environment variable not set')
  console.error('Please click "Connect to Supabase" in the top right corner')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY environment variable not set')
  console.error('Please click "Connect to Supabase" in the top right corner')
}

// Only create client if both values are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration missing. Please connect to Supabase.')
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})
