import { createClient } from '@supabase/supabase-js'

// Get environment variables from Bolt's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? 'Loaded ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables not found. Please ensure Supabase is properly connected in Bolt.')
}

// Create the Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      }
    }
  }
})

// Test connection on initialization
supabaseClient.from('users').select('count').limit(1)
  .then(() => console.log('✅ Supabase connection successful'))
  .catch((error: any) => {
    console.error('❌ Supabase connection failed:', error)
  })

console.log('✅ Supabase client initialized with real connection')