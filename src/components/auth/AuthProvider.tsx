import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

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
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email)
          await loadUserData(session.user.id)
        } else {
          console.log('📱 No existing session found')
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (session?.user) {
        console.log('✅ User signed in:', session.user.email)
        await loadUserData(session.user.id)
      } else {
        console.log('🚪 User signed out')
        setUser(null)
        setAccount(null)
        setSubscription(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (userError) {
        console.error('❌ Error loading user data:', userError)
        return
      }
      
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name
        })
        console.log('✅ User data loaded:', userData.email)
        
        // Load account data
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (accountError) {
          console.error('❌ Error loading account data:', accountError)
        } else if (accountData) {
          setAccount(accountData)
          console.log('✅ Account data loaded - Balance:', accountData.balance)
        }

        // Load subscription data
        await loadSubscription()
      }
    } catch (error) {
      console.error('❌ Error in loadUserData:', error)
    }
  }

  const loadSubscription = async () => {
    try {
      const { data: subscriptionData, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()
      
      if (subscriptionData && !error) {
        setSubscription(subscriptionData)
        console.log('✅ Subscription loaded:', subscriptionData.subscription_status)
      } else if (error) {
        console.error('❌ Error loading subscription:', error)
      } else {
        console.log('📭 No subscription found')
      }
    } catch (error) {
      console.error('❌ Error loading subscription:', error)
    }
  }

  const refreshAccount = async () => {
    if (!user) return
    
    try {
      const { data: accountData, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (accountData && !error) {
        setAccount(accountData)
        console.log('✅ Account refreshed - Balance:', accountData.balance)
      } else {
        console.error('❌ Error refreshing account:', error)
      }
    } catch (error) {
      console.error('❌ Error refreshing account:', error)
    }
  }

  const refreshSubscription = async () => {
    await loadSubscription()
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 Processing funding:', { amount, method, user: user?.email })
    
    if (!user || !account) {
      throw new Error('No authenticated user or account')
    }

    if (amount < 100) {
      throw new Error('Minimum funding amount is $100')
    }
    
    try {
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          type: 'deposit',
          method: method,
          amount: amount,
          status: 'completed',
          description: description || `${method} deposit`,
          metadata: {
            processed_at: new Date().toISOString(),
            platform: 'hedge_fund_web'
          }
        })
        .select()
        .single()

      if (transactionError) {
        console.error('❌ Transaction creation error:', transactionError)
        throw new Error('Failed to create transaction record')
      }

      console.log('✅ Transaction created:', transaction.id)

      // Update account balance
      const newBalance = account.balance + amount
      const newTotalDeposits = account.total_deposits + amount
      
      const { data: updatedAccount, error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: newBalance,
          available_balance: newBalance,
          total_deposits: newTotalDeposits,
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Account update error:', updateError)
        throw new Error('Failed to update account balance')
      }

      // Update local state
      setAccount(updatedAccount)
      
      console.log('✅ Funding processed successfully via Supabase')
      console.log('💰 New balance:', updatedAccount.balance)
      
      return { 
        success: true, 
        data: { 
          new_balance: updatedAccount.balance,
          transaction_id: transaction.id
        } 
      }
      
    } catch (error) {
      console.error('❌ Supabase funding error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.log('❌ Sign in failed:', error.message)
        return { error: { message: error.message } }
      }
      
      if (data.user) {
        console.log('✅ Sign in successful for:', data.user.email)
        // User data will be loaded by the auth state change listener
        return { error: null }
      }
      
      return { error: { message: 'Sign in failed' } }
      
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { error: { message: 'Authentication failed' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: metadata?.full_name || 'New User'
          }
        }
      })
      
      if (error) {
        console.log('❌ Sign up failed:', error.message)
        return { error: { message: error.message } }
      }
      
      if (data.user) {
        console.log('✅ Sign up successful for:', data.user.email)
        // Account will be auto-created by trigger
        return { error: null }
      }
      
      return { error: { message: 'Sign up failed' } }
      
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { error: { message: 'Account creation failed' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error)
      } else {
        console.log('✅ Sign out successful')
        setUser(null)
        setAccount(null)
        setSubscription(null)
      }
    } catch (error) {
      console.error('❌ Sign out error:', error)
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