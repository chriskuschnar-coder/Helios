import { createClient } from '@supabase/supabase-js'
import { supabaseProxyClient } from './supabase-proxy-client'

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

console.log('🔧 Environment:', isWebContainer ? 'WebContainer (Proxy mode)' : 'Standard (Direct mode)')

// Create the client instance
let clientInstance: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('📱 Please click "Connect to Supabase" button in the top right to set up Supabase')
  
  // Create a mock client for development
  clientInstance = {
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
} else if (isWebContainer) {
  // Use proxy client for WebContainer environments
  console.log('🔧 Using Supabase proxy client for WebContainer')
  clientInstance = supabaseProxyClient
} else {
  // Create real Supabase client for standard environments
  console.log('🔄 Creating direct Supabase client')
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
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

  // Test direct connection
  console.log('🔄 Testing direct Supabase connection...')
  clientInstance.from('users').select('count').limit(1)
    .then(() => console.log('✅ Direct Supabase connection successful'))
    .catch((error: any) => {
      console.error('❌ Direct Supabase connection failed:', error)
    })
}

console.log('✅ Supabase client initialized')

// Export the client at top level
export const supabaseClient = clientInstance