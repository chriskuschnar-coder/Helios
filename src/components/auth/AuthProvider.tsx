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
    console.log('🔄 AuthProvider initializing with Supabase...')
    
    // Check for existing Supabase session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('✅ Found Supabase session for:', session.user.email)
          
          // Get user data from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (userData && !userError) {
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name
            })
            
            // Get account data
            const { data: accountData, error: accountError } = await supabase
              .from('accounts')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            if (accountData && !accountError) {
              setAccount(accountData)
              console.log('✅ Account loaded:', accountData.balance)
            }

            // Get subscription data
            await loadSubscription()
          }
        } else {
          console.log('📱 No Supabase session found')
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Fall back to localStorage for demo
        const savedSession = localStorage.getItem('hedge-fund-session')
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession)
            if (session.user) {
              setUser(session.user)
              setAccount(session.account || null)
              console.log('✅ Fallback to localStorage session')
            }
          } catch (e) {
            localStorage.removeItem('hedge-fund-session')
          }
        }
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (session?.user) {
        // User signed in
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name
          })
          
          // Get account
          const { data: accountData } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (accountData) {
            setAccount(accountData)
          }

          // Load subscription
          await loadSubscription()
        }
      } else {
        // User signed out
        setUser(null)
        setAccount(null)
        setSubscription(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
        console.error('Error loading subscription:', error)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
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
        console.log('✅ Account refreshed:', accountData.balance)
      }
    } catch (error) {
      console.error('Error refreshing account:', error)
    }
  }

  const refreshSubscription = async () => {
    await loadSubscription()
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    console.log('💰 Processing funding via Supabase:', { amount, method, user: user?.email })
    
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
          description: description || `${method} deposit`
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction creation error:', transactionError)
        throw new Error('Failed to create transaction record')
      }

      // Update account balance
      const newBalance = account.balance + amount
      const { data: updatedAccount, error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: newBalance,
          available_balance: newBalance,
          total_deposits: account.total_deposits + amount
        })
        .eq('id', account.id)
        .select()
        .single()

      if (updateError) {
        console.error('Account update error:', updateError)
        throw new Error('Failed to update account balance')
      }

      // Update local state
      setAccount(updatedAccount)
      
      console.log('✅ Funding processed successfully via Supabase')
      return { success: true, data: { new_balance: newBalance } }
      
    } catch (error) {
      console.error('❌ Supabase funding error:', error)
      
      // Fallback to localStorage for demo
      console.log('🔄 Falling back to localStorage...')
      const updatedAccount = {
        ...account,
        balance: account.balance + amount,
        available_balance: account.available_balance + amount,
        total_deposits: account.total_deposits + amount
      }
      
      setAccount(updatedAccount)
      
      // Update localStorage session
      const savedSession = localStorage.getItem('hedge-fund-session')
      if (savedSession) {
        const session = JSON.parse(savedSession)
        session.account = updatedAccount
        localStorage.setItem('hedge-fund-session', JSON.stringify(session))
      }
      
      return { success: true, data: { new_balance: updatedAccount.balance } }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting Supabase sign in for:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.log('❌ Supabase sign in failed:', error.message)
        
        // Fallback to demo credentials
        if (email === 'demo@globalmarket.com' && password === 'demo123456') {
          const demoUser = {
            id: 'demo-user',
            email: email,
            full_name: 'Demo User'
          }
          
          const demoAccount = {
            id: 'demo-account',
            balance: 7850.00,
            available_balance: 7850.00,
            total_deposits: 10000.00,
            total_withdrawals: 2150.00,
            currency: 'USD',
            status: 'active'
          }
          
          const demoSession = { user: demoUser, account: demoAccount }
          localStorage.setItem('hedge-fund-session', JSON.stringify(demoSession))
          setUser(demoUser)
          setAccount(demoAccount)
          
          console.log('✅ Demo login successful (localStorage fallback)')
          return { error: null }
        }
        
        return { error: { message: error.message } }
      }
      
      console.log('✅ Supabase sign in successful')
      return { error: null }
      
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { error: { message: 'Authentication failed' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting Supabase sign up for:', email)
    
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
        console.log('❌ Supabase sign up failed:', error.message)
        return { error: { message: error.message } }
      }
      
      console.log('✅ Supabase sign up successful')
      return { error: null }
      
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { error: { message: 'Account creation failed' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('hedge-fund-session')
      setUser(null)
      setAccount(null)
      setSubscription(null)
      console.log('✅ Sign out successful')
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