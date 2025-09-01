import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

console.log("🔑 AuthProvider mounted")

interface User {
  id: string
  email: string
  full_name?: string
  documents_completed?: boolean
  documents_completed_at?: string
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
  markDocumentsCompleted: () => Promise<void>
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
      
      const { data: accountData, error: accountError } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (accountError) {
        console.error('❌ Account load error:', accountError)
      } else {
        console.log('✅ Account loaded:', accountData)
        setAccount(accountData)
      }

      // Also load user profile data to check document completion
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('documents_completed, documents_completed_at')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ User profile load error:', userError)
      } else if (userData) {
        console.log('✅ User profile loaded:', userData)
        
        // Auto-mark documents as completed if user has a funded account (balance > 0)
        // This handles existing users who invested before document tracking was implemented
        if (!userData.documents_completed && accountData && accountData.balance > 0) {
          console.log('🔄 Auto-marking documents as completed for funded user')
          await markDocumentsCompletedInDB(userId)
          userData.documents_completed = true
          userData.documents_completed_at = new Date().toISOString()
        }
        
        setUser(prev => prev ? {
          ...prev,
          documents_completed: userData.documents_completed,
          documents_completed_at: userData.documents_completed_at
        } : null)
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

  const markDocumentsCompletedInDB = async (userId: string) => {
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          documents_completed: true,
          documents_completed_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('❌ Failed to mark documents completed in DB:', error)
      } else {
        console.log('✅ Documents marked as completed in database')
      }
    } catch (err) {
      console.error('❌ Error marking documents completed in DB:', err)
    }
  }

  const markDocumentsCompleted = async () => {
    if (!user) return

    await markDocumentsCompletedInDB(user.id)
    setUser(prev => prev ? {
      ...prev,
      documents_completed: true,
      documents_completed_at: new Date().toISOString()
    } : null)
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn called:', { email, password: '***' })
    
    // Handle demo user immediately without Supabase call
    if (email === 'demo@globalmarket.com' && password === 'demo123456') {
      console.log('✅ Demo login detected - using local demo mode')
      setUser({
        id: 'demo-user-id',
        email: 'demo@globalmarket.com',
        full_name: 'Demo User',
        documents_completed: true,
        documents_completed_at: '2024-01-01T00:00:00Z'
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

    try {
      console.log('🔍 Attempting Supabase authentication...')
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Supabase sign in error:', error.message)

        // If it's invalid credentials and not the demo user, show helpful message
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid login credentials' } }
        }
        
        return { error: { message: error.message } }
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email)
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          documents_completed: false
        })
        await loadUserAccount(data.user.id)
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('❌ Sign in failed:', err)
      return { error: { message: 'Connection error' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 signUp called:', { email, metadata })
    
    try {
      console.log('🔍 Attempting Supabase signup...')
      
      // First check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      console.log('🔍 Environment check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl
      })
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables')
        return { error: { message: 'Database not configured - please contact support' } }
      }
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Supabase sign up error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } }
        }
        if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address' } }
        }
        if (error.message.includes('Password')) {
          return { error: { message: 'Password does not meet requirements' } }
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return { error: { message: 'Connection error - please check your internet and try again' } }
        }
        
        return { error: { message: `Signup failed: ${error.message}` } }
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email)
        console.log('🔍 User ID:', data.user.id)
        console.log('🔍 User confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
        
        // Check if user was created successfully
        if (!data.user.id) {
          console.error('❌ User created but no ID returned')
          return { error: { message: 'Account creation incomplete - please try again' } }
        }
        
        // Try to create user profile and account manually if triggers fail
        console.log('🔄 Creating user profile and account...')
        
        try {
          // First, try to create user profile
          const { error: userProfileError } = await supabaseClient
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: metadata?.full_name,
              kyc_status: 'pending',
              two_factor_enabled: false,
              documents_completed: false
            })
          
          if (userProfileError && !userProfileError.message.includes('duplicate')) {
            console.error('❌ User profile creation error:', userProfileError)
            // Don't fail here - the trigger might have worked
          } else {
            console.log('✅ User profile created or already exists')
          }
          
          // Wait a moment for triggers to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Try to create account if it doesn't exist
          const { error: accountError } = await supabaseClient
            .from('accounts')
            .insert({
              user_id: data.user.id,
              account_type: 'trading',
              balance: 0,
              available_balance: 0,
              total_deposits: 0,
              total_withdrawals: 0,
              currency: 'USD',
              status: 'active'
            })
          
          if (accountError && !accountError.message.includes('duplicate')) {
            console.error('❌ Account creation error:', accountError)
            // Don't fail here - the trigger might have worked
          } else {
            console.log('✅ Account created or already exists')
          }
          
        } catch (setupError) {
          console.error('❌ Manual setup error:', setupError)
          // Continue anyway - user might still be able to login
        }
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: metadata?.full_name,
          documents_completed: false
        })
        
        // Try to load the user's account with retry
        try {
          await loadUserAccount(data.user.id)
        } catch (loadError) {
          console.error('❌ Failed to load user account after signup:', loadError)
          // Don't fail signup - user can try logging in again
        }
        
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('❌ Sign up failed:', err)
      
      // Provide more helpful error messages
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          return { error: { message: 'Connection error - please check your internet and try again' } }
        }
        if (err.message.includes('network')) {
          return { error: { message: 'Network error - please try again' } }
        }
        return { error: { message: `Signup error: ${err.message}` } }
      }
      
      return { error: { message: 'An unexpected error occurred - please try again' } }
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
    markDocumentsCompleted,
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