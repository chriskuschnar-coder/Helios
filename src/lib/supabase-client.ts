import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? 'Loaded ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please click "Connect to Supabase" button in the top right to set up Supabase')
  throw new Error('Missing Supabase environment variables. Please connect to Supabase.')
}

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

// Test connection only if we're not in WebContainer
const isWebContainer = window.location.hostname.includes('webcontainer') || 
                      window.location.hostname.includes('local-credentialless')

if (!isWebContainer) {
  supabaseClient.from('users').select('count').limit(1)
    .then(() => console.log('✅ Supabase connection successful'))
    .catch((error) => {
      console.error('❌ Supabase connection failed:', error)
      console.log('Using localStorage fallback for WebContainer environment')
    })
} else {
  console.log('🔧 WebContainer detected - skipping Supabase connection test')
  console.log('📱 For cross-device login, click "Connect to Supabase" in top right')
}

console.log('✅ Supabase client initialized')