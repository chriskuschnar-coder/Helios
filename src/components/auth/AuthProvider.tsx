import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

interface User {
  id: string
  email: string
  full_name?: string
}

interface Account {
  id: string
  balance: number
  available_balance: number
  total_deposits: number
  total_withdrawals: number
  currency: string
  status: string
}

interface Subscription {
  subscription_status: string
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  payment_method_brand: string | null
  payment_method_last4: string | null
}

interface AuthError {
  message: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  account: Account | null
  subscription: Subscription | null
  refreshAccount: () => Promise<void>
  refreshSubscription: () => Promise<void>
  processFunding: (amount: number, method: string, description?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...')
    
    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        const isProduction = window.location.hostname.includes('netlify') || 
                            window.location.hostname.includes('globalmarketsconsulting.com') ||
                            window.location.hostname !== 'localhost'
        
        console.log('🔍 Environment check:')
        console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
        console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing')
        console.log('Environment:', isProduction ? 'Production (Supabase mode)' : 'Development (localStorage mode)')
        console.log('Hostname:', window.location.hostname)
        
        if (supabaseUrl && supabaseKey) {
          // Try to get current session from Supabase
          try {
            console.log('🔄 Attempting Supabase connection...')
            const { data: { session }, error } = await supabaseClient.auth.getSession()
            
            if (error) {
              console.log('⚠️ Supabase session error:', error.message)
              throw new Error(error.message)
            }
            
            if (session?.user) {
              console.log('✅ Found Supabase session for:', session.user.email)
              setUser({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name
              })
              
              // Load user account from Supabase
              await loadUserAccount(session.user.id)
              await loadUserSubscription(session.user.id)
              setLoading(false)
              return
            } else {
              console.log('📭 No active Supabase session found')
            }
          } catch (supabaseError) {
            console.log('⚠️ Supabase session check failed:', supabaseError)
            // Only fall back to localStorage in development
            if (!isProduction) {
              console.log('🔄 Falling back to localStorage authentication')
            }
          }
        } else {
          console.log('⚠️ Supabase not configured')
          console.log('📱 Click "Connect to Supabase" in Bolt interface for cross-device login')
        }
        
        // Fallback: Check localStorage for existing session (development only)
        if (!isProduction) {
          console.log('🔧 Development environment - using localStorage for demo')
          const storedUser = localStorage.getItem('auth-user')
          const storedAccount = localStorage.getItem('auth-account')
          
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            console.log('✅ Found localStorage session for:', userData.email)
            
            if (storedAccount) {
              setAccount(JSON.parse(storedAccount))
            } else {
              // Load account from localStorage
              const accountData = localStorage.getItem(`account-${userData.id}`)
              if (accountData) {
                setAccount(JSON.parse(accountData))
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    let authSubscription: any = null
    
    // Only set up auth listener if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      try {
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event)
          
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name
            })
            await loadUserAccount(session.user.id)
            await loadUserSubscription(session.user.id)
          } else {
            setUser(null)
            setAccount(null)
            setSubscription(null)
          }
        })
        authSubscription = subscription
      } catch (error) {
        console.log('⚠️ Could not set up Supabase auth listener:', error)
      }
    }

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  const loadUserAccount = async (userId: string) => {
    try {
      console.log('🔄 Loading account for user:', userId)
      const { data, error } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('⚠️ Supabase account load failed:', error.message)
        // Try localStorage fallback
        const accountData = localStorage.getItem(`account-${userId}`)
        if (accountData) {
          setAccount(JSON.parse(accountData))
          console.log('✅ Account loaded from localStorage')
        }
        return
      }

      setAccount(data)
      console.log('✅ Account loaded:', data)
    } catch (error) {
      console.log('⚠️ Account loading error, using localStorage fallback:', error)
      const accountData = localStorage.getItem(`account-${userId}`)
      if (accountData) {
        setAccount(JSON.parse(accountData))
        console.log('✅ Account loaded from localStorage fallback')
      }
    }
  }

  const loadUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('customer_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.log('⚠️ Subscription load failed:', error.message)
        return
      }

      setSubscription(data)
      console.log('✅ Subscription loaded:', data)
    } catch (error) {
      console.log('⚠️ Subscription loading error:', error)
    }
  }

  const refreshAccount = async () => {
    if (user) {
      await loadUserAccount(user.id)
    }
  }

  const refreshSubscription = async () => {
    if (user) {
      await loadUserSubscription(user.id)
    }
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 Processing funding:', { amount, method, user: user?.email })
    
    if (!user) {
      throw new Error('No authenticated user')
    }

    if (amount < 100) {
      throw new Error('Minimum funding amount is $100')
    }

    try {
      // Check if Supabase is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        // Try Supabase first
        try {
          // Create transaction record
          const { data: transaction, error: transactionError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: user.id,
              type: 'deposit',
              method: method,
              amount: amount,
              status: 'completed',
              description: description || `${method} deposit`,
              metadata: {
                processed_at: new Date().toISOString(),
                method: method
              }
            })
            .select()
            .single()

          if (transactionError) {
            console.log('⚠️ Supabase transaction creation failed:', transactionError.message)
            throw new Error('Failed to create transaction record')
          }

          // Update account balance
          if (account) {
            const { error: updateError } = await supabaseClient
              .from('accounts')
              .update({
                balance: account.balance + amount,
                available_balance: account.available_balance + amount,
                total_deposits: account.total_deposits + amount
              })
              .eq('id', account.id)

            if (updateError) {
              throw new Error('Failed to update account balance')
            }

            // Update local state
            setAccount({
              ...account,
              balance: account.balance + amount,
              available_balance: account.available_balance + amount,
              total_deposits: account.total_deposits + amount
            })
          }

          console.log('✅ Funding processed successfully via Supabase')
          return {
            data: { success: true, transaction },
            error: null,
            success: true
          }
        } catch (supabaseError) {
          console.log('⚠️ Supabase funding failed, using localStorage fallback:', supabaseError)
        }
      }
      
      // Fallback: localStorage funding
      if (account) {
        const updatedAccount = {
          ...account,
          balance: account.balance + amount,
          available_balance: account.available_balance + amount,
          total_deposits: account.total_deposits + amount
        }
        
        // Update localStorage
        localStorage.setItem(`account-${user.id}`, JSON.stringify(updatedAccount))
        localStorage.setItem('auth-account', JSON.stringify(updatedAccount))
        
        setAccount(updatedAccount)
        
        console.log('✅ Funding processed via localStorage fallback')
        return {
          data: { success: true },
          error: null,
          success: true
        }
      }
    } catch (error) {
      console.error('❌ Funding error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    // Always try Supabase first if configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      console.log('🔄 Attempting Supabase authentication...')
      
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          throw new Error(error.message)
        }

        console.log('✅ Supabase sign in successful')
        return { error: null }
      } catch (supabaseError) {
        console.log('⚠️ Supabase auth failed:', supabaseError)
        return { error: { message: 'Authentication failed - please check your credentials' } }
      }
    }
    
    // Fallback: localStorage authentication (development only)
    const isProduction = window.location.hostname.includes('netlify') || 
                        window.location.hostname.includes('globalmarketsconsulting.com') ||
                        window.location.hostname !== 'localhost'
    
    if (!isProduction) {
      console.log('🔧 Development mode - using localStorage authentication')
      
      if (email === 'demo@globalmarket.com' || email === 'demo') {
        const demoUser = {
          id: 'demo-user-id',
          email: 'demo@globalmarket.com',
          full_name: 'Demo User'
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('auth-user', JSON.stringify(demoUser))
        localStorage.setItem('auth-account', JSON.stringify({
          id: 'demo-account-id',
          balance: 7850,
          available_balance: 7850,
          total_deposits: 8000,
          total_withdrawals: 150,
          currency: 'USD',
          status: 'active'
        }))
        
        setUser(demoUser)
        setAccount({
          id: 'demo-account-id',
          balance: 7850,
          available_balance: 7850,
          total_deposits: 8000,
          total_withdrawals: 150,
          currency: 'USD',
          status: 'active'
        })
        
        console.log('✅ Demo login successful')
        return { error: null }
      } else {
        // Check localStorage for registered users
        const storedUsers = JSON.parse(localStorage.getItem('registered-users') || '[]')
        const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password)
        
        if (foundUser) {
          const userData = {
            id: foundUser.id,
            email: foundUser.email,
            full_name: foundUser.full_name
          }
          
          localStorage.setItem('auth-user', JSON.stringify(userData))
          
          // Load or create account
          const accountKey = `account-${foundUser.id}`
          let accountData = JSON.parse(localStorage.getItem(accountKey) || 'null')
          
          if (!accountData) {
            accountData = {
              id: `account-${foundUser.id}`,
              balance: 0,
              available_balance: 0,
              total_deposits: 0,
              total_withdrawals: 0,
              currency: 'USD',
              status: 'active'
            }
            localStorage.setItem(accountKey, JSON.stringify(accountData))
          }
          
          setUser(userData)
          setAccount(accountData)
          
          console.log('✅ Fallback login successful')
          return { error: null }
        } else {
          return { error: { message: 'Invalid email or password' } }
        }
      }
    } else {
      return { error: { message: 'Supabase not configured - please connect to Supabase' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    // Always try Supabase first if configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      console.log('🔄 Attempting Supabase signup...')
      
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        })

        if (error) {
          throw new Error(error.message)
        }

        console.log('✅ Supabase sign up successful')
        return { error: null }
      } catch (supabaseError) {
        console.log('⚠️ Supabase signup failed:', supabaseError)
        return { error: { message: 'Registration failed - please try again' } }
      }
    }
    
    // Fallback: localStorage signup (development only)
    const isProduction = window.location.hostname.includes('netlify') || 
                        window.location.hostname.includes('globalmarketsconsulting.com') ||
                        window.location.hostname !== 'localhost'
    
    if (!isProduction) {
      console.log('🔧 Development mode - using localStorage signup')
      
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newUser = {
        id: userId,
        email,
        password, // In production, this would be hashed
        full_name: metadata?.full_name || '',
        created_at: new Date().toISOString()
      }
      
      // Store user
      const existingUsers = JSON.parse(localStorage.getItem('registered-users') || '[]')
      
      // Check if email already exists
      if (existingUsers.find((u: any) => u.email === email)) {
        return { error: { message: 'Email already registered' } }
      }
      
      existingUsers.push(newUser)
      localStorage.setItem('registered-users', JSON.stringify(existingUsers))
      
      // Create account
      const accountData = {
        id: `account-${userId}`,
        balance: 0,
        available_balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        currency: 'USD',
        status: 'active'
      }
      localStorage.setItem(`account-${userId}`, JSON.stringify(accountData))
      
      // Auto-login the new user
      const userData = {
        id: userId,
        email,
        full_name: metadata?.full_name || ''
      }
      
      localStorage.setItem('auth-user', JSON.stringify(userData))
      setUser(userData)
      setAccount(accountData)
      
      console.log('✅ Fallback signup successful')
      return { error: null }
    } else {
      return { error: { message: 'Supabase not configured - please connect to Supabase' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      // Try Supabase signout if available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        try {
          const { error } = await supabaseClient.auth.signOut()
          if (error) {
            console.error('Supabase sign out error:', error)
          }
        } catch (supabaseError) {
          console.log('⚠️ Supabase signout failed, using fallback')
        }
      }
      
      // Clear local storage
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-account')
      
      setUser(null)
      setAccount(null)
      setSubscription(null)
      
      console.log('✅ Sign out successful')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const value = {
    user,
    loading,
    account,
    subscription,
    refreshAccount,
    refreshSubscription,
    processFunding,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}