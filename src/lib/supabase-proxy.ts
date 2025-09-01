// Proxy client for WebContainer environments
// This bypasses CORS issues by using Supabase Edge Functions

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-proxy`

class SupabaseProxy {
  private baseUrl: string
  private anonKey: string

  constructor(url: string, anonKey: string) {
    this.baseUrl = url
    this.anonKey = anonKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${EDGE_FUNCTION_URL}/${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.anonKey}`,
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Proxy request failed:', error)
      throw error
    }
  }

  // Test connection
  async testConnection() {
    return this.makeRequest('test-connection')
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return this.makeRequest('auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    },

    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      return this.makeRequest('auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          metadata: credentials.options?.data,
        }),
      })
    },

    signOut: async () => {
      return this.makeRequest('auth/signout', {
        method: 'POST',
      })
    },

    getSession: async () => {
      // For WebContainer, we'll manage sessions differently
      const token = localStorage.getItem('supabase-token')
      return { 
        data: { 
          session: token ? { access_token: token } : null 
        }, 
        error: null 
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simplified auth state management for WebContainer
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }

  // Table operations
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const token = localStorage.getItem('supabase-token')
            return this.makeRequest(`${table}?${column}=eq.${value}&select=${columns}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            })
          },
          limit: async (count: number) => {
            const token = localStorage.getItem('supabase-token')
            return this.makeRequest(`${table}?${column}=eq.${value}&select=${columns}&limit=${count}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            })
          }
        }),
        limit: async (count: number) => {
          const token = localStorage.getItem('supabase-token')
          return this.makeRequest(`${table}?select=${columns}&limit=${count}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          })
        },
        order: (column: string, options: { ascending: boolean }) => ({
          limit: async (count: number) => {
            const token = localStorage.getItem('supabase-token')
            const order = options.ascending ? 'asc' : 'desc'
            return this.makeRequest(`${table}?select=${columns}&order=${column}.${order}&limit=${count}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            })
          }
        })
      })
    }
  }
}

export const supabaseProxy = new SupabaseProxy(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)