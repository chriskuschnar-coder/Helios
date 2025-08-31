import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let clientInstance: any

if (!supabaseUrl || !supabaseAnonKey) {
  // Create mock client for development
  console.log('⚠️ Supabase credentials not found, using mock client')
  clientInstance = {
    auth: {
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
  // Create real Supabase client for production
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

  // Test connection
  console.log('🔄 Testing Supabase connection...')
  clientInstance.from('users').select('count').limit(1)
    .then(() => console.log('✅ Supabase connection successful'))
    .catch((error: any) => {
      console.error('❌ Supabase connection failed:', error)
    })
}

console.log('✅ Supabase client initialized')

// Export the client
export const supabaseClient = clientInstance