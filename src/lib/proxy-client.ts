// Client that uses the proxy server instead of direct Supabase calls
const PROXY_URL = 'http://localhost:3001'

interface AuthResponse {
  data: { user?: any; session?: any }
  error?: { message: string }
}

interface QueryResponse {
  data: any
  error?: { message: string }
}

class ProxySupabaseClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = PROXY_URL
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        return await response.json()
      } catch (error) {
        return { data: {}, error: { message: 'Connection failed' } }
      }
    },

    signUp: async (credentials: { email: string; password: string; options?: any }): Promise<AuthResponse> => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            metadata: credentials.options?.data
          })
        })
        
        return await response.json()
      } catch (error) {
        return { data: {}, error: { message: 'Connection failed' } }
      }
    },

    signOut: async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/signout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        return await response.json()
      } catch (error) {
        return { error: { message: 'Connection failed' } }
      }
    },

    getSession: async () => {
      // For proxy mode, manage sessions locally
      const user = localStorage.getItem('proxy-user')
      return {
        data: {
          session: user ? { user: JSON.parse(user) } : null
        },
        error: null
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simplified for proxy mode
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }

  // Database methods
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async (): Promise<QueryResponse> => {
            try {
              const response = await fetch(`${this.baseUrl}/${table}/${value}`)
              return await response.json()
            } catch (error) {
              return { data: null, error: { message: 'Connection failed' } }
            }
          }
        })
      }),

      insert: (values: any) => ({
        select: () => ({
          single: async (): Promise<QueryResponse> => {
            try {
              const response = await fetch(`${this.baseUrl}/${table}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
              })
              return await response.json()
            } catch (error) {
              return { data: null, error: { message: 'Connection failed' } }
            }
          }
        })
      }),

      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async (): Promise<QueryResponse> => {
              try {
                const response = await fetch(`${this.baseUrl}/${table}/${value}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(values)
                })
                return await response.json()
              } catch (error) {
                return { data: null, error: { message: 'Connection failed' } }
              }
            }
          })
        })
      })
    }
  }
}

export const proxyClient = new ProxySupabaseClient()