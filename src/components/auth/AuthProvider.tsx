import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

interface User {
  id: string
  email: string
  full_name?: string
  documents_completed?: boolean
  documents_completed_at?: string
  kyc_status?: string
  is_kyc_verified?: boolean
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
        setLoading(true)
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.warn('Session check error:', error)
          setLoading(false)
        } else if (session?.user) {
          console.log('Found existing session for:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name
          })
          await loadUserAccount(session.user.id)
          setLoading(false)
        } else {
          console.log('No existing session found')
          setLoading(false)
        }
      } catch (err) {
        console.error('Session check failed:', err)
        setLoading(false)
      }
    }

    // Set a maximum timeout for loading state
    const timeoutId = setTimeout(() => {
      console.log('Auth timeout - forcing loading to false')
      setLoading(false)
    }, 2000) // Reduced to 2 seconds

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        clearTimeout(timeoutId) // Clear timeout when auth state changes
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name
          })
          await loadUserAccount(session.user.id)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAccount(null)
          setSubscription(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const loadUserAccount = async (userId: string) => {
    try {
      console.log('📊 Loading user account for:', userId)
      // Ensure investor_units exists for this user
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (session) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
        
        // Auto-create investor_units if missing
        try {
          await fetch(`${supabaseUrl}/functions/v1/auto-create-investor-units`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': anonKey
            },
            body: JSON.stringify({ user_id: userId })
          })
        } catch (error) {
          console.warn('⚠️ Auto-create investor units failed:', error)
        }
      }

      const { data: accountData, error: accountError } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)

      if (accountError) {
        console.warn('⚠️ Account load error:', accountError)
        // Don't throw error, just continue without account data
      } else if (accountData && accountData.length > 0) {
        console.log('✅ Account loaded:', accountData.id)
        setAccount(accountData[0])
      } else {
        // No account found, create one
        console.log('📝 Creating new account for user:', userId)
        const { data: newAccountData, error: createError } = await supabaseClient
          .from('accounts')
          .insert({
            user_id: userId,
            account_type: 'trading',
            balance: 0.00,
            available_balance: 0.00,
            total_deposits: 0.00,
            total_withdrawals: 0.00,
            currency: 'USD',
            status: 'active'
          })
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Failed to create account:', createError)
        } else {
          console.log('✅ New account created:', newAccountData.id)
          setAccount(newAccountData)
        }
      }

      // Load user profile data
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('documents_completed, documents_completed_at, kyc_status')
        .eq('id', userId)
        .single()

      if (!userError && userData) {
        console.log('✅ User profile loaded')
        setUser(prev => prev ? {
          ...prev,
          documents_completed: userData.documents_completed,
          documents_completed_at: userData.documents_completed_at,
          kyc_status: userData.kyc_status,
          is_kyc_verified: userData.kyc_status === 'verified'
        } : null)
      }
    } catch (err) {
      console.error('❌ Account load failed:', err)
      // Don't let account loading errors prevent the app from working
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
      // STEP 1: Process deposit allocation through fund units
      console.log('💰 Processing deposit allocation:', { amount, method })
      
      const { supabaseClient } = await import('../../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      // Call deposit allocation function
      const allocationResponse = await fetch(`${supabaseUrl}/functions/v1/process-deposit-allocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          user_id: user.id,
          deposit_amount: amount,
          payment_method: method,
          reference_id: description
        })
      })

      if (!allocationResponse.ok) {
        const error = await allocationResponse.json()
        throw new Error(error.error || 'Failed to process deposit allocation')
      }

      const allocationResult = await allocationResponse.json()
      console.log('✅ Deposit allocation successful:', allocationResult)

      // STEP 2: Create transaction record for tracking
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
          description: description || `${method} deposit - ${allocationResult.units_allocated.toFixed(4)} units allocated`
        })

      if (transactionError) {
        console.error('Transaction error:', transactionError)
        throw new Error('Failed to record transaction')
      }

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
    
    // Immediately clear user state (don't wait for auth state change)
    setUser(null)
    setAccount(null)
    setSubscription(null)
    
    // Also clear any localStorage data
    try {
      localStorage.removeItem('supabase.auth.token')
      localStorage.clear()
    } catch (err) {
      console.warn('Failed to clear localStorage:', err)
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