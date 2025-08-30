// Enhanced Supabase client that works in deployed environments
// Uses Edge Functions to handle auth and database operations

interface SupabaseResponse<T = any> {
  data: T | null
  error: any
  success: boolean
}

class DeployedSupabaseClient {
  private edgeFunctionUrl: string
  private anonKey: string
  private session: any = null
  private isWebContainer: boolean

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    this.isWebContainer = window?.location?.hostname?.includes('webcontainer') || 
                         window?.location?.hostname?.includes('stackblitz') ||
                         window?.location?.hostname?.includes('bolt') || false
    
    if (!supabaseUrl || !anonKey) {
      console.warn('Missing Supabase environment variables - using demo mode')
      this.edgeFunctionUrl = ''
      this.anonKey = ''
      this.isWebContainer = true
      return
    }
    
    this.edgeFunctionUrl = `${supabaseUrl}/functions/v1/hedge-fund-api`
    this.anonKey = anonKey
    this.isWebContainer = window.location.hostname.includes('webcontainer') || 
                         window.location.hostname.includes('stackblitz') ||
                         window.location.hostname.includes('bolt')
    
    console.log('🔍 Supabase client initialized with Edge Function URL:', this.edgeFunctionUrl)
    
    // Try to restore session from localStorage
    const savedSession = localStorage.getItem('supabase-session')
    if (savedSession) {
      try {
        this.session = JSON.parse(savedSession)
        console.log('📱 Restored session from localStorage')
      } catch (e) {
        console.log('❌ Invalid session in localStorage, clearing')
        localStorage.removeItem('supabase-session')
      }
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<SupabaseResponse> {
    // If missing config, use demo mode
    if (!this.edgeFunctionUrl || !this.anonKey) {
      return this.handleDemoMode(endpoint, options)
    }

    // If in WebContainer or missing config, use demo mode
    if (this.isWebContainer || !this.edgeFunctionUrl) {
      return this.handleDemoMode(endpoint, options)
    }

    const url = `${this.edgeFunctionUrl}/${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.anonKey,
      ...(this.session?.access_token && {
        'Authorization': `Bearer ${this.session.access_token}`
      }),
      ...options.headers,
    }

    try {
      console.log(`🔄 Making request to: ${url}`)
      console.log('📋 Headers:', { ...headers, apikey: '[HIDDEN]', Authorization: this.session?.access_token ? '[TOKEN]' : 'None' })
      
      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log(`📡 Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP Error ${response.status}:`, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`✅ Response from ${endpoint}:`, result)
      
      return result
    } catch (error) {
      console.error(`❌ Request to ${endpoint} failed:`, error)
      
      // Provide more specific error information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          data: null,
          error: { 
            message: 'WebContainer network restriction - Edge Function cannot be reached',
            details: error.message,
            suggestion: 'This is expected in WebContainer. Download and run locally for full functionality.'
          },
          success: false
        }
      }
      
      return {
        data: null,
        error: { message: error.message || 'Unknown error' },
        success: false
      }
    }
  }

  private async handleDemoMode(endpoint: string, options: RequestInit = {}): Promise<SupabaseResponse> {
    console.log('🎭 Using demo mode for:', endpoint)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (endpoint === 'test-connection') {
      return {
        data: { message: 'Demo mode - connection simulated' },
        error: null,
        success: true
      }
    }
    
    if (endpoint === 'auth/signin') {
      const body = JSON.parse(options.body as string || '{}')
      const { email, password } = body
      
      // Demo credentials
      if (email === 'demo@globalmarket.com' && password === 'demo123456') {
        const demoSession = {
          user: { id: 'demo-user', email: email },
          access_token: 'demo-token'
        }
        this.session = demoSession
        localStorage.setItem('supabase-session', JSON.stringify(demoSession))
        
        return {
          data: { user: demoSession.user, session: demoSession },
          error: null,
          success: true
        }
      } else {
        return {
          data: null,
          error: { message: 'Invalid credentials. Use demo@globalmarket.com / demo123456' },
          success: false
        }
      }
    }
    
    if (endpoint === 'auth/signup') {
      const body = JSON.parse(options.body as string || '{}')
      const { email } = body
      
      const newUser = {
        user: { id: 'new-user-' + Date.now(), email: email },
        access_token: 'new-user-token'
      }
      this.session = newUser
      localStorage.setItem('supabase-session', JSON.stringify(newUser))
      
      return {
        data: { user: newUser.user, session: newUser },
        error: null,
        success: true
      }
    }
    
    if (endpoint === 'auth/signout') {
      this.session = null
      localStorage.removeItem('supabase-session')
      return {
        data: null,
        error: null,
        success: true
      }
    }
    
    // Default demo response
    return {
      data: { message: 'Demo mode active' },
      error: null,
      success: true
    }
  }

  // Test connection
  async testConnection(): Promise<SupabaseResponse> {
    return this.makeRequest('test-connection')
  }

  // Auth methods
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }): Promise<SupabaseResponse> => {
      console.log('🔐 Attempting sign in for:', credentials.email)
      
      const result = await this.makeRequest('auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      
      if (result.success && result.data?.session) {
        this.session = result.data.session
        localStorage.setItem('supabase-session', JSON.stringify(this.session))
        console.log('✅ Sign in successful, session saved')
      } else {
        console.log('❌ Sign in failed:', result.error)
      }
      
      return result
    },

    signUp: async (credentials: { email: string; password: string; options?: any }): Promise<SupabaseResponse> => {
      console.log('📝 Attempting sign up for:', credentials.email)
      
      return this.makeRequest('auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          metadata: credentials.options?.data,
        }),
      })
    },

    signOut: async (): Promise<SupabaseResponse> => {
      console.log('🚪 Signing out...')
      
      const result = await this.makeRequest('auth/signout', {
        method: 'POST',
      })
      
      if (result.success) {
        this.session = null
        localStorage.removeItem('supabase-session')
        console.log('✅ Sign out successful')
      }
      
      return result
    },

    getSession: async () => {
      return { 
        data: { session: this.session }, 
        error: null 
      }
    },

    getUser: async () => {
      if (!this.session) {
        return { data: { user: null }, error: null }
      }
      
      return { 
        data: { user: this.session.user }, 
        error: null 
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simplified auth state management
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => console.log('🔇 Auth listener unsubscribed') 
          } 
        } 
      }
    }
  }

  // Table operations
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async (): Promise<SupabaseResponse> => {
            return this.makeRequest(`${table}?${column}=eq.${value}&select=${columns}&single=true`)
          },
          limit: async (count: number): Promise<SupabaseResponse> => {
            return this.makeRequest(`${table}?${column}=eq.${value}&select=${columns}&limit=${count}`)
          }
        }),
        limit: async (count: number): Promise<SupabaseResponse> => {
          return this.makeRequest(`${table}?select=${columns}&limit=${count}`)
        },
        order: (column: string, options: { ascending: boolean }) => ({
          limit: async (count: number): Promise<SupabaseResponse> => {
            const order = options.ascending ? 'asc' : 'desc'
            return this.makeRequest(`${table}?select=${columns}&order=${column}.${order}&limit=${count}`)
          }
        })
      })
    }
  }

  // Insert operations
  async insert(table: string, data: any): Promise<SupabaseResponse> {
    return this.makeRequest(`${table}/insert`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Update operations
  async update(table: string, data: any, conditions: any): Promise<SupabaseResponse> {
    return this.makeRequest(`${table}/update`, {
      method: 'PUT',
      body: JSON.stringify({ data, conditions }),
    })
  }
}

export const supabaseClient = new DeployedSupabaseClient()