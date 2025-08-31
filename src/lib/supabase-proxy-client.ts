// Client-side proxy for Supabase calls in WebContainer environment
class SupabaseProxyClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/supabase-proxy'
  }

  private async makeRequest(action: string, data?: any) {
    try {
      console.log('🔄 Making proxy request:', action, data)
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        ...data
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
    return this.makeRequest('test-connection', {
      method: 'POST',
      body: JSON.stringify({ action: 'test-connection' })
    })
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return this.makeRequest('auth-signin', {
        method: 'POST',
        body: JSON.stringify({ action: 'auth-signin', data: credentials })
      })
    },

    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      return this.makeRequest('auth-signup', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'auth-signup',
          data: {
            email: credentials.email,
            password: credentials.password,
            metadata: credentials.options?.data
          }
        })
      })
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
            return this.makeRequest('select', {
              method: 'POST',
              body: JSON.stringify({
                action: 'select',
                table,
                data: { columns, single: true },
                filters: { eq: { column, value } }
              })
            })
          },
          limit: async (count: number) => {
            return this.makeRequest('select', {
              method: 'POST',
              body: JSON.stringify({
                action: 'select',
                table,
                data: { columns },
                filters: { eq: { column, value }, limit: count }
              })
            })
          }
        }),
        limit: async (count: number) => {
          return this.makeRequest('select', {
            method: 'POST',
            body: JSON.stringify({
              action: 'select',
              table,
              data: { columns },
              filters: { limit: count }
            })
          })
        }
      }),
      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            return this.makeRequest('insert', {
              table,
              data: { values }
            })
          }
        })
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          async then(callback: (result: any) => void) {
            const result = await this.makeRequest('update', {
              table,
              data: { values, where: { column, value } }
            })
            callback(result)
            return result
          }
        })
      })
    }
  }
}

export const supabaseProxyClient = new SupabaseProxyClient()