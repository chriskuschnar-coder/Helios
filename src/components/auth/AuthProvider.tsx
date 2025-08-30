import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  [key: string]: any
}

interface AuthError {
  message: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  account: any | null
  refreshAccount: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<any | null>(null)

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...')
    
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('supabase-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        console.log('📱 Found saved session:', session)
        if (session.user) {
          setUser(session.user)
          setAccount(session.account || null)
          console.log('✅ User restored from session:', session.user.email)
        }
      } catch (e) {
        console.log('❌ Invalid session in localStorage, clearing')
        localStorage.removeItem('hedge-fund-session')
      }
    }
    
    setLoading(false)
    console.log('✅ AuthProvider initialized')
  }, [])

  const refreshAccount = async () => {
    if (!user) return
    
    try {
      // Get fresh account data
      const accountResult = await supabaseClient.getUserAccount()
      if (accountResult.success && accountResult.data) {
        setAccount(accountResult.data)
        
        // Update saved session
        const savedSession = localStorage.getItem('hedge-fund-session')
        if (savedSession) {
          const session = JSON.parse(savedSession)
          session.account = accountResult.data
          localStorage.setItem('hedge-fund-session', JSON.stringify(session))
        }
      }
    } catch (error) {
      console.error('Error refreshing account:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    try {
      // Check demo credentials first
      if (email === 'demo@globalmarket.com' && password === 'demo123456') {
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          email: email,
          full_name: 'Demo User'
        }
        
        // Demo account with existing balance
        const demoAccount = {
          id: 'demo-account',
          balance: 7850.00,
          available_balance: 7850.00,
          total_deposits: 8000.00,
          total_withdrawals: 0,
          currency: 'USD',
          status: 'active'
        }
        
        const demoSession = {
          user: demoUser,
          account: demoAccount,
          access_token: 'demo-token-' + Date.now()
        }
        
        // Save session
        localStorage.setItem('supabase-session', JSON.stringify(demoSession))
        setUser(demoUser)
        setAccount(demoAccount)
        
        console.log('✅ Demo login successful')
        return { error: null }
      }
      
      // For other credentials, show error
      console.log('❌ Invalid credentials provided')
      return { 
        error: { 
          message: 'Invalid credentials. Please use demo@globalmarket.com / demo123456' 
        } 
      }
      
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { 
        error: { 
          message: 'Authentication failed. Please try again.' 
        } 
      }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    try {
      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        email: email,
        full_name: metadata?.full_name || 'New User'
      }
      
      // New users start with $0 balance
      const newAccount = {
        id: 'account-' + Date.now(),
        balance: 0.00,
        available_balance: 0.00,
        total_deposits: 0.00,
        total_withdrawals: 0.00,
        currency: 'USD',
        status: 'active'
      }
      
      const newSession = {
        user: newUser,
        account: newAccount,
        access_token: 'token-' + Date.now()
      }
      
      // Save session
      localStorage.setItem('supabase-session', JSON.stringify(newSession))
      setUser(newUser)
      setAccount(newAccount)
      
      console.log('✅ Sign up successful')
      return { error: null }
      
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { 
        error: { 
          message: 'Account creation failed. Please try again.' 
        } 
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      // Clear session
      localStorage.removeItem('supabase-session')
      setUser(null)
      setAccount(null)
      
      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    account,
    refreshAccount,
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