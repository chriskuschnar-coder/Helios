import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabaseClient } from '../lib/supabase-client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect - checking for existing session')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking Supabase session...')
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
        } else {
          console.log('✅ Supabase connection test successful')
          if (session) {
            console.log('✅ Found existing session for:', session.user.email)
            setSession(session)
            setUser(session.user)
          } else {
            console.log('ℹ️ No existing session found')
          }
        }
      } catch (err) {
        console.error('❌ Session check error:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            console.log('🔄 Creating user profile manually...')
            const metadata = session.user.user_metadata || {}
            
            const { error: profileError } = await supabaseClient
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: metadata?.full_name,
                kyc_status: 'pending',
                two_factor_enabled: false,
                documents_completed: false
              })
            
            if (profileError && !profileError.message.includes('duplicate key')) {
              console.error('❌ Failed to create user profile:', profileError)
            } else {
              console.log('✅ User profile created or already exists')
            }
            
            // Create account
            console.log('🔄 Creating user account manually...')
            
            const { error: accountError } = await supabaseClient
              .from('accounts')
              .insert({
                user_id: session.user.id,
                account_type: 'trading',
                balance: 0,
                available_balance: 0,
                total_deposits: 0,
                total_withdrawals: 0,
                currency: 'USD',
                status: 'active'
              })
            
            if (accountError && !accountError.message.includes('duplicate key')) {
              console.error('❌ Failed to create user account:', accountError)
            } else {
              console.log('✅ User account created or already exists')
            }
            
          } catch (manualError) {
            console.error('❌ Manual user creation failed:', manualError)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn called with:', { email, password: '***' })
    setLoading(true)
    
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.log('❌ Sign in failed:', error.message)
        return { error }
      }
      
      console.log('✅ Sign in successful:', data.user?.email)
      return { error: null }
    } catch (err) {
      console.error('❌ Sign in error:', err)
      return { 
        error: { 
          message: 'Connection error - please try again',
          name: 'ConnectionError'
        } as AuthError 
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 signUp called:', { email, metadata })
    setLoading(true)
    
    try {
      console.log('🔄 Attempting Supabase signup...')
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) {
        console.error('❌ Supabase sign up error:', error)
        return { error }
      }
      
      console.log('✅ Supabase signup successful:', data.user?.email)
      return { error: null }
    } catch (err) {
      console.error('❌ Sign up error:', err)
      return { 
        error: { 
          message: 'Database error saving new user',
          name: 'DatabaseError'
        } as AuthError 
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabaseClient.auth.signOut()
    } catch (err) {
      console.error('❌ Sign out error:', err)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider