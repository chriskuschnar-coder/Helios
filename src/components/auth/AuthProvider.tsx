import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  account: any
  markDocumentsCompleted: () => Promise<void>
  processFunding: (amount: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  session: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  account: null,
  markDocumentsCompleted: async () => {},
  processFunding: async () => {}
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<any>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await loadUserAccount(session.user.id)
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserAccount(session.user.id)
        } else {
          setAccount(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserAccount = async (userId: string) => {
    try {
      const { data: accountData, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading account:', error)
      } else {
        setAccount(accountData)
      }
    } catch (error) {
      console.error('Account loading error:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign in catch error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up catch error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      setUser(null)
      setSession(null)
      setAccount(null)
    } catch (error) {
      console.error('Sign out catch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markDocumentsCompleted = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          documents_completed: true,
          documents_completed_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error marking documents completed:', error)
      }
    } catch (error) {
      console.error('Documents completion error:', error)
    }
  }

  const processFunding = async (amount: number) => {
    if (!user || !account) return

    try {
      // Create a funding transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          type: 'deposit',
          method: 'stripe',
          amount: amount,
          status: 'completed'
        })

      if (error) {
        console.error('Error processing funding:', error)
      }
    } catch (error) {
      console.error('Funding processing error:', error)
    }
  }

  const value = {
    user,
    loading,
    session,
    signIn,
    signUp,
    signOut,
    account,
    markDocumentsCompleted,
    processFunding
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}