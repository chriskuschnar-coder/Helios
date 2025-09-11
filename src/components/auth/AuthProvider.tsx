import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  documents_completed?: boolean
  documents_completed_at?: string
  kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
  is_kyc_verified?: boolean
  two_factor_enabled?: boolean
  two_factor_method?: 'email' | 'sms' | 'biometric'
  subscription_signed_at?: string
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
  pending2FA: boolean
  pendingAuthData: { userData: any; session: any } | null
  account: Account | null
  subscription: Subscription | null
  refreshAccount: () => Promise<void>
  refreshSubscription: () => Promise<void>
  processFunding: (amount: number, method: string, description?: string) => Promise<any>
  markDocumentsCompleted: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; requires2FA?: boolean; userData?: any; session?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  complete2FA: (code: string, userData: any, session: any) => Promise<{ success: boolean }>
  profile: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending2FA, setPending2FA] = useState(false)
  const [pendingAuthData, setPendingAuthData] = useState<{ userData: any; session: any } | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  const complete2FA = async (code: string, userData: any, session: any) => {
    try {
      console.log('🔐 Completing 2FA authentication for user:', userData.email)
      
      // Verify the 2FA code first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          user_id: userData.id,
          code: code,
          method: 'email',
          email: userData.email
        })
      })


      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        console.error('❌ Verify response error:', errorData)
        throw new Error(errorData.error || 'Invalid verification code')
      }

      const verifyResult = await verifyResponse.json()
      console.log('✅ 2FA verification result:', { 
        valid: verifyResult.valid, 
        success: verifyResult.success,
        message: verifyResult.message 
      })
      
      if (!verifyResult.valid || !verifyResult.success) {
        throw new Error(verifyResult.error || verifyResult.message || 'Invalid verification code')
      }

      console.log('✅ 2FA code verified successfully')
      
      // Set the Supabase session to complete login
      console.log('🔐 Setting Supabase session...')
      const { error: sessionError } = await supabaseClient.auth.setSession(session)
      
      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError)
        throw new Error('Failed to complete authentication')
      }
      
      // Verify session is actually set
      const { data: { session: currentSession } } = await supabaseClient.auth.getSession()
      if (!currentSession) {
        throw new Error('Session not properly established')
      }
      
      console.log('✅ Session verified and established')
      
      // Clear 2FA pending state
      setPending2FA(false)
      setPendingAuthData(null)
      
      // Set user state immediately
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.user_metadata?.full_name,
        phone: userData.user_metadata?.phone
      })
      
      // Load account data
      await loadUserAccount(userData.id)
      
      console.log('🎉 2FA completion successful!')
      return { success: true }
    } catch (error) {
      console.error('❌ 2FA completion failed:', error)
      throw error
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.warn('Session check error:', error)
          setLoading(false)
        } else if (session) {
          console.log('✅ Existing session found, but requiring fresh login for security')
          // Clear any existing session to force fresh login
          await supabaseClient.auth.signOut()
          setLoading(false)
        } else {
          console.log('No existing session found or session check error')
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
    }, 1000) // Reduced to 1 second

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        clearTimeout(timeoutId) // Clear timeout when auth state changes
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setAccount(null)
          setSubscription(null)
          setProfile(null)
          setPending2FA(false)
          setPendingAuthData(null)
          setLoading(false)
        }
        // Don't auto-authenticate on any event - require explicit login
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
        .select('documents_completed, documents_completed_at, kyc_status, two_factor_enabled, two_factor_method, phone, full_name, subscription_signed_at')
        .eq('id', userId)
        .single()

      if (!userError && userData) {
        console.log('✅ User profile loaded')
        setUser(prev => prev ? {
          ...prev,
          full_name: userData.full_name,
          phone: userData.phone,
          documents_completed: userData.documents_completed,
          documents_completed_at: userData.documents_completed_at,
          kyc_status: userData.kyc_status,
          is_kyc_verified: userData.kyc_status === 'verified',
          two_factor_enabled: userData.two_factor_enabled,
          two_factor_method: userData.two_factor_method,
          subscription_signed_at: userData.subscription_signed_at
        } : null)
        
        setProfile(userData)
      }
    } catch (err) {
      console.error('❌ Account load failed:', err)
      // Don't let account loading errors prevent the app from working
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserAccount(user.id)
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

  const markKYCVerified = async () => {
    if (!user) return

    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          kyc_status: 'verified',
          kyc_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Failed to mark KYC verified:', error)
      } else {
        setUser(prev => prev ? {
          ...prev,
          kyc_status: 'verified',
          is_kyc_verified: true,
          kyc_verified_at: new Date().toISOString()
        } : null)
        
        setProfile(prev => prev ? {
          ...prev,
          kyc_status: 'verified',
          is_kyc_verified: true,
          kyc_verified_at: new Date().toISOString()
        } : null)
      }
    } catch (err) {
      console.error('Error marking KYC verified:', err)
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
        
        // Set pending 2FA state and return requires2FA flag
        setPending2FA(true)
        setPendingAuthData({ userData: data.user, session: data.session })
        
        return { error: null, requires2FA: true }
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
        
        // Create user profile with phone number
        try {
          const { error: profileError } = await supabaseClient
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: metadata?.full_name,
              phone: metadata?.phone,
              welcome_email_sent: false,
              onboarding_completed_at: null
            })

          if (profileError) {
            console.error('Error creating user profile:', profileError)
          } else {
            console.log('✅ User profile created successfully')
            
            // Send welcome email
            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
              const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
              
              const welcomeResponse = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': anonKey,
                  'origin': window.location.origin
                },
                body: JSON.stringify({
                  user_id: data.user.id,
                  email: data.user.email,
                  full_name: metadata?.full_name
                })
              })

              if (welcomeResponse.ok) {
                console.log('✅ Welcome email sent successfully')
              } else {
                console.warn('⚠️ Welcome email failed to send')
              }
            } catch (emailError) {
              console.warn('⚠️ Welcome email error:', emailError)
              // Don't fail signup if email fails
            }
          }
        } catch (err) {
          console.error('Unexpected error inserting user profile:', err)
        }

        return { 
          error: null, 
          showWelcome: true,
          userData: {
            email: data.user.email,
            full_name: metadata?.full_name
          }
        }
      }

      return { error: { message: 'No user returned from signup' } }
    } catch (err) {
      console.error('Sign up failed:', err)
      return { error: { message: 'Connection error during signup' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...')
      
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        // Handle session_not_found gracefully - this is expected when session already expired
        if (error.message?.includes('Session from session_id claim in JWT does not exist')) {
          console.warn('⚠️ Session already expired on server, proceeding with local logout')
        } else {
          console.error('Sign out error:', error)
        }
      } else {
        console.log('✅ Sign out successful')
      }
      
      // Always clear state and reload page for clean logout
      setUser(null)
      setAccount(null)
      setSubscription(null)
      setProfile(null)
      
      // Force page reload to ensure clean state
      window.location.reload()
    } catch (err) {
      // Handle session_not_found gracefully
      if (err instanceof Error && err.message?.includes('Session from session_id claim in JWT does not exist')) {
        console.warn('⚠️ Session already expired, proceeding with local logout')
      } else {
        console.error('Sign out failed:', err)
      }
      
      // Always force reload and clear state on any error
      setUser(null)
      setAccount(null)
      setSubscription(null)
      setProfile(null)
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      pending2FA,
      pendingAuthData,
      account,
      subscription,
      profile,
      refreshAccount,
      refreshSubscription,
      refreshProfile,
      processFunding,
      markDocumentsCompleted,
      markKYCVerified,
      signIn,
      complete2FA,
      signUp,
      signOut
    }}>
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