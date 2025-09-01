import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

console.log("🔑 AuthProvider mounted")

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
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔍 AuthProvider useEffect - checking for existing session')
    
    const checkSession = async () => {
      try {
        console.log('🔍 Checking Supabase session...')
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('❌ Session check error:', error)
        } else if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name
          })
          await loadUserAccount(session.user.id)
        } else {
          console.log('ℹ️ No existing session found')
        }
      } catch (err) {
        console.error('❌ Session check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const loadUserAccount = async (userId: string) => {
    try {
      console.log('🔍 Loading account for user:', userId)
      
      const { data, error } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Account load error:', error)
      } else {
        console.log('✅ Account loaded:', data)
        setAccount(data)
      }
    } catch (err) {
      console.error('❌ Account load failed:', err)
    }
  }

  const refreshAccount = async () => {
    if (user) {
      await loadUserAccount(user.id)
    }
  }

  const refreshSubscription = async () => {
    console.log('🔄 refreshSubscription called')
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 processFunding called:', { amount, method, description })
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (!account) {
      throw new Error('User account not found')
    }

    try {
      // Add transaction record
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          type: 'deposit',
          method: method,
          amount: amount,
          status: 'completed',
          description: description || `${method} deposit`
        })

      if (transactionError) {
        console.error('❌ Transaction error:', transactionError)
        throw new Error('Failed to record transaction')
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
          console.error('❌ Account update error:', updateError)
          throw new Error('Failed to update account balance')
        }

        // Refresh account data
        await refreshAccount()
      }

      console.log('✅ Funding processed successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Funding processing failed:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn called:', { email, password: '***' })
    
    try {
      console.log('🔍 Attempting Supabase authentication...')
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Supabase sign in error:', error.message)

        // If it's invalid credentials and demo user, fall back to demo mode
        if (email === 'demo@globalmarket.com' && password === 'demo123456') {
          console.log('✅ Demo login fallback (Supabase user not found)')
          setUser({
            id: 'demo-user-id',
            email: 'demo@globalmarket.com',
            full_name: 'Demo User'
          })
          setAccount({
            id: 'demo-account-id',
            balance: 7850,
            available_balance: 7850,
            total_deposits: 8000,
            total_withdrawals: 150,
            currency: 'USD',
            status: 'active'
          })
          return { error: null }
        }

        // If it's invalid credentials and not the demo user, show helpful message
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid credentials. Try demo@globalmarket.com / demo123456' } }
        }
        
        return { error: { message: error.message } }
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email)
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name
        })
        await loadUserAccount(data.user.id)
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('❌ Sign in failed:', err)
      return { error: { message: 'Connection error. Try demo@globalmarket.com / demo123456' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 signUp called:', { email, metadata })
    
    try {
      console.log('🔍 Attempting Supabase signup...')
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Supabase sign up error:', error.message, error)
        return { error: { message: error.message } }
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email)
        console.log('🔍 User data:', data.user)
        
        // Wait a moment for the trigger to create the account
        console.log('⏳ Waiting for account creation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: metadata?.full_name
        })
        
        // Try to load the user's account
        await loadUserAccount(data.user.id)
        
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('❌ Sign up failed:', err)
      return { error: { message: 'Connection error' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 signOut called')
    
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
      }
    } catch (err) {
      console.error('❌ Sign out failed:', err)
    } finally {
      setUser(null)
      setAccount(null)
      setSubscription(null)
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