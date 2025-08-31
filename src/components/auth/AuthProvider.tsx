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
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
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
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
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
      const { data: userData, error: userError } = await supabaseClient
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
        const { data: accountData, error: accountError } = await supabaseClient
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
      const { data: subscriptionData, error } = await supabaseClient
        .from('stripe_user_subscriptions')
        .select('*')
        .limit(1)
      
      if (subscriptionData && subscriptionData.length > 0 && !error) {
        setSubscription(subscriptionData[0])
        console.log('✅ Subscription loaded:', subscriptionData[0].subscription_status)
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
      const { data: accountData, error } = await supabaseClient
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
    
    if (!user) {
      throw new Error('No authenticated user')
    }

    if (amount < 100) {
      throw new Error('Minimum funding amount is $100')
    }
    
    try {
      // Use the robust funding processor
      const result = await supabaseClient.processFunding(amount, method, description)
      
      // Refresh account data to get updated balance
      await refreshAccount()
      
      return result
      
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
      const { data, error } = await supabaseClient.auth.signUp({
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
      const { error } = await supabaseClient.auth.signOut()
      
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