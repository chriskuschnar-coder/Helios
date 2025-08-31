// WebContainer-compatible Supabase proxy
// This bypasses fetch restrictions in credentialless environments

interface SupabaseConfig {
  url: string
  anonKey: string
}

interface AuthResponse {
  data: { user?: any; session?: any }
  error?: { message: string }
}

interface QueryResponse {
  data: any
  error?: { message: string }
}

class WebContainerSupabaseProxy {
  private config: SupabaseConfig
  private mockUsers: Map<string, any> = new Map()
  private mockAccounts: Map<string, any> = new Map()
  private currentUser: any = null

  constructor(url: string, anonKey: string) {
    this.config = { url, anonKey }
    this.initializeMockData()
  }

  private initializeMockData() {
    // Demo user with existing balance
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@globalmarket.com',
      full_name: 'Demo User'
    }
    
    const demoAccount = {
      id: 'demo-account-id',
      user_id: 'demo-user-id',
      balance: 7850.00,
      available_balance: 7850.00,
      total_deposits: 8000.00,
      total_withdrawals: 150.00,
      currency: 'USD',
      status: 'active'
    }

    this.mockUsers.set('demo@globalmarket.com', demoUser)
    this.mockAccounts.set('demo-user-id', demoAccount)

    console.log('🎭 Mock data initialized for WebContainer environment')
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      console.log('🔐 WebContainer Auth: Sign in attempt for', credentials.email)
      
      // Check demo credentials
      if (credentials.email === 'demo@globalmarket.com' && credentials.password === 'demo123456') {
        const user = this.mockUsers.get(credentials.email)
        this.currentUser = user
        localStorage.setItem('webcontainer-user', JSON.stringify(user))
        
        return {
          data: {
            user,
            session: { access_token: 'mock-token', user }
          }
        }
      }

      // Check if user exists in localStorage (for new signups)
      const storedUsers = JSON.parse(localStorage.getItem('webcontainer-users') || '{}')
      if (storedUsers[credentials.email] && storedUsers[credentials.email].password === credentials.password) {
        const user = storedUsers[credentials.email].user
        this.currentUser = user
        localStorage.setItem('webcontainer-user', JSON.stringify(user))
        
        return {
          data: {
            user,
            session: { access_token: 'mock-token', user }
          }
        }
      }

      return {
        data: {},
        error: { message: 'Invalid credentials' }
      }
    },

    signUp: async (credentials: { email: string; password: string; options?: any }): Promise<AuthResponse> => {
      console.log('📝 WebContainer Auth: Sign up attempt for', credentials.email)
      
      const userId = 'user-' + Date.now()
      const user = {
        id: userId,
        email: credentials.email,
        full_name: credentials.options?.data?.full_name || 'New User'
      }

      // Store user in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('webcontainer-users') || '{}')
      storedUsers[credentials.email] = {
        user,
        password: credentials.password
      }
      localStorage.setItem('webcontainer-users', JSON.stringify(storedUsers))

      // Create account for new user
      const account = {
        id: 'account-' + Date.now(),
        user_id: userId,
        balance: 0.00,
        available_balance: 0.00,
        total_deposits: 0.00,
        total_withdrawals: 0.00,
        currency: 'USD',
        status: 'active'
      }
      
      this.mockAccounts.set(userId, account)
      this.currentUser = user
      localStorage.setItem('webcontainer-user', JSON.stringify(user))

      return {
        data: {
          user,
          session: { access_token: 'mock-token', user }
        }
      }
    },

    signOut: async () => {
      console.log('🚪 WebContainer Auth: Sign out')
      this.currentUser = null
      localStorage.removeItem('webcontainer-user')
      return { error: null }
    },

    getSession: async () => {
      const storedUser = localStorage.getItem('webcontainer-user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        this.currentUser = user
        return {
          data: {
            session: { access_token: 'mock-token', user }
          },
          error: null
        }
      }
      return {
        data: { session: null },
        error: null
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simplified for WebContainer
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }

  // Database methods
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async (): Promise<QueryResponse> => {
            console.log(`🗃️ WebContainer DB: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`)
            
            if (table === 'users' && column === 'id') {
              const user = Array.from(this.mockUsers.values()).find(u => u.id === value)
              return user ? { data: user } : { data: null, error: { message: 'User not found' } }
            }
            
            if (table === 'accounts' && column === 'user_id') {
              const account = this.mockAccounts.get(value)
              return account ? { data: account } : { data: null, error: { message: 'Account not found' } }
            }

            return { data: null, error: { message: 'Not found' } }
          }
        }),
        
        limit: async (count: number): Promise<QueryResponse> => {
          console.log(`🗃️ WebContainer DB: SELECT ${columns} FROM ${table} LIMIT ${count}`)
          return { data: [] }
        }
      }),

      insert: (values: any) => ({
        select: () => ({
          single: async (): Promise<QueryResponse> => {
            console.log(`🗃️ WebContainer DB: INSERT INTO ${table}`, values)
            
            if (table === 'transactions') {
              // Mock transaction creation
              return {
                data: {
                  id: 'txn-' + Date.now(),
                  ...values,
                  created_at: new Date().toISOString()
                }
              }
            }
            
            return { data: values }
          }
        })
      }),

      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          async single(): Promise<QueryResponse> {
            console.log(`🗃️ WebContainer DB: UPDATE ${table} SET`, values, `WHERE ${column} = ${value}`)
            
            if (table === 'accounts' && column === 'id') {
              // Update account balance in memory
              const account = this.mockAccounts.get(value) || this.mockAccounts.get(this.currentUser?.id)
              if (account) {
                Object.assign(account, values)
                this.mockAccounts.set(account.user_id, account)
                return { data: account }
              }
            }
            
            return { data: values }
          }
        })
      })
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    console.log('🧪 WebContainer: Testing connection (using mock data)')
    return true
  }
}

// Export the proxy instance
export const webContainerSupabase = new WebContainerSupabaseProxy(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

// Test if we're in WebContainer environment
export const isWebContainer = window.location.hostname.includes('webcontainer-api.io') || 
                              window.location.hostname.includes('stackblitz.io') ||
                              window.location.hostname.includes('local-credentialless')

console.log('🌐 Environment detected:', isWebContainer ? 'WebContainer (using proxy)' : 'Standard (using Supabase)')