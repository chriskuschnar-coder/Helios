import React, { createContext, useContext, useState, useEffect } from 'react'
// import { supabaseClient } from '../../lib/supabase-client'

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
  // Force demo mode in WebContainer
  const isWebContainer = true
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...')
    
    // Initialize auth state
    const initializeAuth = async () => {
      // Check localStorage for existing session
      const savedSession = localStorage.getItem('supabase-session')
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession)
          setUser(session.user)
          setAccount(session.account)
          console.log('✅ Restored session from localStorage')
        } catch (e) {
          console.log('❌ Invalid session in localStorage, clearing')
          localStorage.removeItem('supabase-session')
        }
      }
        setLoading(false)
    }
    
    initializeAuth()
  }, [])

  const refreshAccount = async () => {
    // In WebContainer, refresh from localStorage
    const savedSession = localStorage.getItem('supabase-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setAccount(session.account)
        console.log('✅ Account refreshed from localStorage')
      } catch (e) {
        console.log('❌ Error refreshing account from localStorage')
      }
    }
  }

  const refreshSubscription = async () => {
    // Demo mode - no subscriptions
    console.log('📭 No subscription system in demo mode')
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 Processing funding:', { amount, method, user: user?.email })
    
    if (!user) {
      throw new Error('No authenticated user')
    }

    if (amount < 100) {
      throw new Error('Minimum funding amount is $100')
    }
    
    // WebContainer demo mode - update localStorage directly
    const savedSession = localStorage.getItem('supabase-session')
    if (!savedSession) {
      throw new Error('No active session')
    }
    
    const session = JSON.parse(savedSession)
    if (!session.user) {
      throw new Error('No user in session')
    }
    
    // Update account balance
    session.account.balance += amount
    session.account.available_balance += amount
    session.account.total_deposits += amount
    
    // Save updated session
    localStorage.setItem('supabase-session', JSON.stringify(session))
    
    // Update state
    setAccount(session.account)
    
    console.log('✅ Funding processed successfully in demo mode')
    return {
      data: { success: true, new_balance: session.account.balance },
      error: null,
      success: true
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    // Demo mode authentication
    if (email === 'demo@globalmarket.com' && password === 'demo123456') {
      const demoSession = {
        user: { id: 'demo-user', email: email, full_name: 'Demo User' },
        account: {
          id: 'demo-account',
          balance: 7850,
          available_balance: 7850,
          total_deposits: 10000,
          total_withdrawals: 0,
          currency: 'USD',
          status: 'active'
        }
      }
      
      localStorage.setItem('supabase-session', JSON.stringify(demoSession))
      setUser(demoSession.user)
      setAccount(demoSession.account)
      
      console.log('✅ Demo login successful')
      return { error: null }
    }
    
    // Check for existing users in localStorage
    const allUsers = JSON.parse(localStorage.getItem('hedge-fund-users') || '[]')
    const existingUser = allUsers.find((u: any) => u.email === email && u.password === password)
    
    if (existingUser) {
      const userSession = {
        user: { id: existingUser.id, email: existingUser.email, full_name: existingUser.full_name },
        account: {
          id: existingUser.account_id,
          balance: existingUser.balance,
          available_balance: existingUser.available_balance,
          total_deposits: existingUser.total_deposits,
          total_withdrawals: existingUser.total_withdrawals,
          currency: 'USD',
          status: 'active'
        }
      }
      
      localStorage.setItem('supabase-session', JSON.stringify(userSession))
      setUser(userSession.user)
      setAccount(userSession.account)
      
      console.log('✅ User login successful')
      return { error: null }
    }
    
    return { error: { message: 'Invalid credentials' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    // Check if user already exists
    const allUsers = JSON.parse(localStorage.getItem('hedge-fund-users') || '[]')
    const existingUser = allUsers.find((u: any) => u.email === email)
    
    if (existingUser) {
      return { error: { message: 'User already exists' } }
    }
    
    // Create new user
    const newUser = {
      id: 'user-' + Date.now(),
      email: email,
      password: password,
      full_name: metadata?.full_name || 'New User',
      account_id: 'account-' + Date.now(),
      balance: 0,
      available_balance: 0,
      total_deposits: 0,
      total_withdrawals: 0,
      created_at: new Date().toISOString()
    }
    
    // Save to localStorage
    allUsers.push(newUser)
    localStorage.setItem('hedge-fund-users', JSON.stringify(allUsers))
    
    // Create session
    const userSession = {
      user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name },
      account: {
        id: newUser.account_id,
        balance: newUser.balance,
        available_balance: newUser.available_balance,
        total_deposits: newUser.total_deposits,
        total_withdrawals: newUser.total_withdrawals,
        currency: 'USD',
        status: 'active'
      }
    }
    
    localStorage.setItem('supabase-session', JSON.stringify(userSession))
    setUser(userSession.user)
    setAccount(userSession.account)
    
    console.log('✅ New user created successfully')
    return { error: null }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    localStorage.removeItem('supabase-session')
    setUser(null)
    setAccount(null)
    setSubscription(null)
    console.log('✅ Sign out successful')
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