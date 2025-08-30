import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabaseClient } from '../../lib/supabase-client'

interface User {
  id: string
  email: string
  [key: string]: any
}

interface AuthError {
  message: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider initializing...')
    
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      } else {
        console.log('Initial session:', session?.user?.email || 'No user')
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user?.email || 'No user')
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email)
    
    const result = await supabaseClient.auth.signInWithPassword({ email, password })
    
    if (result.error) {
      console.error('Sign in error:', result.error)
    } else if (result.success && result.data?.user) {
      setUser(result.data.user)
    }
    
    return { error: result.error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('Attempting sign up for:', email)
    
    const result = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (result.error) {
      console.error('Sign up error:', result.error)
    } else if (result.success && result.data?.user) {
      setUser(result.data.user)
    }
    
    return { error: result.error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    const result = await supabaseClient.auth.signOut()
    if (result.success) {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
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