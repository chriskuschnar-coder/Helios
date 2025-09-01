import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase Environment Check:')
console.log('URL:', supabaseUrl ? 'Loaded ✅' : 'Missing ❌')
console.log('Anon Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌')

// Create the client instance
let clientInstance: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('📱 Please click "Connect to Supabase" button in Bolt')
  
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
} else {
  // Create direct Supabase client (bypassing any WebContainer proxy)
  console.log('🔄 Creating DIRECT Supabase client to:', supabaseUrl)
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    // Force direct connection, bypass any proxy
    global: {
      fetch: fetch.bind(globalThis)
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
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

  // Test connection
  console.log('🔄 Testing DIRECT Supabase connection to:', supabaseUrl)
  clientInstance.from('users').select('count').limit(1)
    .then(() => console.log('✅ DIRECT Supabase connection successful'))
    .catch((error: any) => {
      console.error('❌ DIRECT Supabase connection failed:', error)
      console.log('🔍 Check if URL is correct:', supabaseUrl)
    })
}

console.log('✅ Supabase client initialized with DIRECT connection')

// Export the client
export const supabaseClient = clientInstance