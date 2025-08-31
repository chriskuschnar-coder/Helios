import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? 'Loaded ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌')

// Check if we're in WebContainer environment
const isWebContainer = typeof window !== 'undefined' && (
  window.location.hostname.includes('webcontainer') || 
  window.location.hostname.includes('local-credentialless') ||
  window.location.hostname.includes('stackblitz') ||
  window.location.hostname.includes('bolt.new')
)

console.log('🔧 Environment:', isWebContainer ? 'WebContainer (Edge Functions mode)' : 'Standard (Direct mode)')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('📱 Please click "Connect to Supabase" button in the top right to set up Supabase')
  
  // Create a mock client for development
  export const supabaseClient = {
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } })
        }),
        limit: async () => ({ data: [], error: { message: 'Supabase not configured' } })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } })
        })
      }),
      update: () => ({
        eq: () => ({ error: { message: 'Supabase not configured' } })
      })
    })
  }
} else {
  // Create real Supabase client
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

  // Test connection only if not in WebContainer
  if (!isWebContainer) {
    console.log('🔄 Testing direct Supabase connection...')
    supabaseClient.from('users').select('count').limit(1)
      .then(() => console.log('✅ Direct Supabase connection successful'))
      .catch((error) => {
        console.error('❌ Direct Supabase connection failed:', error)
        console.log('💡 This is normal in WebContainer - Edge Functions will handle API calls')
      })
  } else {
    console.log('🔧 WebContainer detected - using Edge Functions for Supabase calls')
    console.log('📱 For cross-device login, ensure Supabase is connected in Bolt interface')
  }

  console.log('✅ Supabase client initialized')
}