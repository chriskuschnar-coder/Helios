import React, { createContext, useContext, useState, useEffect } from 'react'

console.log("🔑 AuthProvider mounted");

// BASIC TEST: Check if AuthProvider loads at all
console.log('🔍 AuthProvider loaded - basic test')
console.log('🔍 AuthProvider file executing')
console.log('🔍 React imported:', !!React)

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
  console.log('🔍 AuthProvider component rendering...')
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false) // Start with false to avoid loading state
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Mock functions for now to test if component loads
  const refreshAccount = async () => {
    console.log('🔄 refreshAccount called')
  }

  const refreshSubscription = async () => {
    console.log('🔄 refreshSubscription called')
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 processFunding called:', { amount, method, description })
    return { success: true }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn called:', { email, password: '***' })
    
    // Demo user check
    if (email === 'demo@globalmarket.com' && password === 'demo123456') {
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@globalmarket.com',
        full_name: 'Demo User'
      }
      
      const demoAccount = {
        id: 'demo-account-id',
        balance: 7850,
        available_balance: 7850,
        total_deposits: 10000,
        total_withdrawals: 0,
        currency: 'USD',
        status: 'active'
      }
      
      setUser(demoUser)
      setAccount(demoAccount)
      
      console.log('✅ Demo login successful')
      return { error: null }
    }
    
    return { error: { message: 'Invalid credentials' } }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 signUp called:', { email, metadata })
    return { error: { message: 'Signup not implemented yet' } }
  }

  const signOut = async () => {
    console.log('🚪 signOut called')
    setUser(null)
    setAccount(null)
    setSubscription(null)
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

  console.log('🔍 AuthProvider rendering with value:', { user: !!user, loading, account: !!account })

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