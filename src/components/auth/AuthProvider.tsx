import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

// Debug: Check if supabaseClient is properly imported
console.log('🔍 AuthProvider - supabaseClient:', supabaseClient)

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
        // Check for current Supabase session
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('✅ Found active session for:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name
          })
          
          await loadUserAccount(session.user.id)
          await loadUserSubscription(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth state changes
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

    return () => {
      subscription.unsubscribe()
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
        console.error('Account load error:', error)
        return
      }

      setAccount(data)
      console.log('✅ Account loaded:', data)
    } catch (error) {
      console.error('Account loading error:', error)
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
        console.error('Subscription load error:', error)
        return
      }

      setSubscription(data)
      console.log('✅ Subscription loaded:', data)
    } catch (error) {
      console.error('Subscription loading error:', error)
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

      console.log('✅ Funding processed successfully')
      return {
        data: { success: true, transaction },
        error: null,
        success: true
      }
    } catch (error) {
      console.error('❌ Funding error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error: { message: error.message } }
      }

      console.log('✅ Sign in successful')
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'Authentication failed' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { error: { message: error.message } }
      }

      console.log('✅ Sign up successful')
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'Registration failed' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      
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