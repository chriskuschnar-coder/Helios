import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabaseClient } from '../../lib/supabase-client'

interface Account {
  id: string
  balance: number
  available_balance: number
  total_deposits: number
  total_withdrawals: number
  currency: string
  status: string
  units_held: number
  nav_per_unit: number
  fund_allocation_pct: number
}

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  kyc_status: string
  two_factor_enabled: boolean
  last_login?: string
  documents_completed: boolean
  documents_completed_at?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  account: Account | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const fetchAccount = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching account:', error)
        return
      }

      setAccount(data)
    } catch (error) {
      console.error('Error in fetchAccount:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const refreshAccount = async () => {
    if (user) {
      await fetchAccount(user.id)
    }
  }

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('⚠️ Session error:', error.message)
        // Clear invalid session
        supabaseClient.auth.signOut()
        setSession(null)
        setUser(null)
        setProfile(null)
        setAccount(null)
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchAccount(session.user.id)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'session exists' : 'no session')
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully')
        }
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          console.log('👋 User signed out or deleted')
          setSession(null)
          setUser(null)
          setProfile(null)
          setAccount(null)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchAccount(session.user.id)
        } else {
          setProfile(null)
          setAccount(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
      setAccount(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Force clear state even if signOut fails
      setSession(null)
      setUser(null)
      setProfile(null)
      setAccount(null)
    }
  }

  const value = {
    user,
    profile,
    account,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    refreshAccount,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}