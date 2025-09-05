import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.warn('Session check error:', error)
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
        console.warn('Session check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name
          })
          await loadUserAccount(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAccount(null)
          setSubscription(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserAccount = async (userId: string) => {
    try {
      // Load account data
      const { data: accountData, error: accountError } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (accountError) {
        console.warn('Account load error:', accountError)
      } else {
        setAccount(accountData)
      }

      // Load user profile data
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('documents_completed, documents_completed_at')
        .eq('id', userId)
        .single()

      if (!userError && userData) {
        setUser(prev => prev ? {
          ...prev,
          documents_completed: userData.documents_completed,
          documents_completed_at: userData.documents_completed_at
        } : null)
      }
    } catch (err) {
      console.warn('Account load failed:', err)
    }
  }

  const refreshAccount = async () => {
    if (user) {
      await loadUserAccount(user.id)
    }
  }

  const refreshSubscription = async () => {
    // Subscription refresh logic here
  }

  const processFunding = async (amount: number, method: string, description?: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (!account) {
      throw new Error('User account not found')
    }

    try {
      // CRITICAL: Use the new deposit processing function that handles fund units
      console.log('💰 Processing deposit through fund allocation system:', { amount, method, userId: user.id })
      
      const { data, error } = await supabaseClient.rpc('process_user_deposit', {
        p_user_id: user.id,
        p_deposit_amount: amount,
        p_method: method,
        p_description: description || `${method} deposit`
      })

      if (error) {
        console.error('Deposit processing error:', error)
        throw new Error('Failed to process deposit: ' + error.message)
      }

      console.log('✅ Deposit processed successfully:', data)
      
      // Refresh account data to show updated balance
      await refreshAccount()

      return { success: true }
    } catch (error) {
      console.error('Funding processing failed:', error)
      throw error
    }
  }

  const markDocumentsCompleted = async () => {
    if (!user) return

    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          documents_completed: true,
          documents_completed_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to mark documents completed:', error)
      } else {
        setUser(prev => prev ? {
          ...prev,
          documents_completed: true,
          documents_completed_at: new Date().toISOString()
        } : null)
      }
    } catch (err) {
      console.error('Error marking documents completed:', err)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email)
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password. Please check your credentials and try again.' } }
        }
        
        return { error: { message: error.message } }
      }

      if (data.user) {
        console.log('✅ Sign in successful for:', data.user.email)
        // User state will be updated via onAuthStateChange
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('Sign in failed:', err)
      return { error: { message: 'Connection error' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('📝 Attempting sign up for:', email)
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Sign up error:', error)
        
        if (error.message.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } }
        }
        
        if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address.' } }
        }
        
        if (error.message.includes('Password')) {
          return { error: { message: 'Password must be at least 6 characters long.' } }
        }
        
        return { error: { message: `Signup failed: ${error.message}` } }
      }

      if (data.user) {
        console.log('✅ Sign up successful for:', data.user.email)
        // User state will be updated via onAuthStateChange
        return { error: null }
      }

      return { error: { message: 'No user returned' } }
    } catch (err) {
      console.error('Sign up failed:', err)
      return { error: { message: 'Connection error' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user')
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('✅ Sign out successful')
      }
    } catch (err) {
      console.error('Sign out failed:', err)
    }
    // User state will be cleared via onAuthStateChange
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