// Client-side proxy for Supabase calls in WebContainer environment
class SupabaseProxyClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/supabase-proxy'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log('🔄 Making proxy request to:', url)
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Expected JSON but got:', text.substring(0, 200))
        throw new Error('Server returned HTML instead of JSON - proxy route not found')
      }

      const result = await response.json()
      console.log('✅ Proxy request successful:', result)
      return result
    } catch (error) {
      console.error('❌ Proxy request failed:', error)
      throw error
    }
  }

  // Test connection
  async testConnection() {
    return this.makeRequest('/test-connection')
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return fetch(`${this.baseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }).then(res => res.json())
    },

    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      return fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          metadata: credentials.options?.data
        })
      }).then(res => res.json())
    },

    signOut: async () => {
      // For proxy mode, we'll handle signout client-side
      return { error: null }
    },

    getSession: async () => {
      // For proxy mode, we'll manage sessions client-side
      const token = localStorage.getItem('supabase-session')
      return { 
        data: { 
          session: token ? JSON.parse(token) : null 
        }, 
        error: null 
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simplified auth state management for proxy mode
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }

  // Table operations
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            return this.makeRequest(`/${table}?${column}=eq.${value}&select=${columns}`)
          },
          limit: async (count: number) => {
            return this.makeRequest(`/${table}?${column}=eq.${value}&select=${columns}&limit=${count}`)
          }
        }),
        limit: async (count: number) => {
          return this.makeRequest(`/${table}?select=${columns}&limit=${count}`)
        }
      }),
      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            return fetch(`${this.baseUrl}/${table}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ values })
            }).then(res => res.json())
          }
        })
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          async then(callback: (result: any) => void) {
            const result = await fetch(`${this.baseUrl}/${table}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ values, where: { column, value } })
            }).then(res => res.json())
            callback(result)
            return result
          }
        })
      })
    }
  }
}

export const supabaseProxyClient = new SupabaseProxyClient()