import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

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
  account: any | null
  refreshAccount: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<any | null>(null)

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...')
    
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('supabase-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        console.log('📱 Found saved session:', session)
        if (session.user) {
          setUser(session.user)
          setAccount(session.account || null)
          console.log('✅ User restored from session:', session.user.email)
        }
      } catch (e) {
        console.log('❌ Invalid session in localStorage, clearing')
        localStorage.removeItem('hedge-fund-session')
      }
    }
    
    setLoading(false)
    console.log('✅ AuthProvider initialized')
  }, [])

  const refreshAccount = async () => {
    if (!user) return
    
    try {
      // Get fresh account data
      const accountResult = await supabaseClient.getUserAccount()
      if (accountResult.success && accountResult.data) {
        setAccount(accountResult.data)
        
        // Update saved session
        const savedSession = localStorage.getItem('supabase-session')
        if (savedSession) {
          const session = JSON.parse(savedSession)
          session.account = accountResult.data
          localStorage.setItem('supabase-session', JSON.stringify(session))
        }
      }
    } catch (error) {
      console.error('Error refreshing account:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    
    try {
      // Handle demo credentials
      if (email === 'demo@globalmarket.com' && password === 'demo123456') {
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          email: email,
          full_name: 'Demo User'
        }
        
        // Demo account with existing balance
        const demoAccount = {
          id: 'demo-account',
          balance: 10000.00,
          available_balance: 10000.00,
          total_deposits: 10000.00,
          total_withdrawals: 0,
          currency: 'USD',
          status: 'active'
        }
        
        const demoSession = {
          user: demoUser,
          account: demoAccount,
          access_token: 'demo-token-' + Date.now()
        }
        
        // Save session
        localStorage.setItem('supabase-session', JSON.stringify(demoSession))
        setUser(demoUser)
        setAccount(demoAccount)
        
        console.log('✅ Demo login successful')
        return { error: null }
      }
      
      // Handle real user authentication
      console.log('🔐 Attempting real user authentication...')
      
      // Check if user exists in localStorage (simulated database)
      const allUsers = JSON.parse(localStorage.getItem('hedge-fund-users') || '[]')
      const existingUser = allUsers.find((u: any) => u.email === email && u.password === password)
      
      if (existingUser) {
        console.log('✅ Found existing user:', existingUser.email)
        
        // Get user's account data
        const userAccount = {
          id: existingUser.accountId,
          balance: existingUser.balance || 5000, // Give new users some demo balance
          available_balance: existingUser.available_balance || 5000,
          total_deposits: existingUser.total_deposits || 5000,
          total_withdrawals: existingUser.total_withdrawals || 0,
          currency: 'USD',
          status: 'active'
        }
        
        const userSession = {
          user: { 
            id: existingUser.id, 
            email: existingUser.email, 
            full_name: existingUser.full_name 
          },
          account: userAccount,
          access_token: 'user-token-' + Date.now()
        }
        
        // Save session
        localStorage.setItem('supabase-session', JSON.stringify(userSession))
        setUser(userSession.user)
        setAccount(userAccount)
        
        console.log('✅ Real user login successful')
        return { error: null }
      } else {
        console.log('❌ Invalid credentials for real user')
        return { 
          error: { 
            message: 'Invalid email or password. Please check your credentials.' 
          } 
        }
      }
      
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { 
        error: { 
          message: 'Authentication failed. Please try again.' 
        } 
      }
    }
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
      // Create transaction record in Supabase
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          method: method,
          amount: amount,
          status: 'completed',
          description: description || `Investment funding - ${method}`,
          metadata: {
            funding_method: method,
            processed_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction creation error:', transactionError)
        throw new Error('Failed to record transaction')
      }

      // Update account balance
      const { data: updatedAccount, error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: (account?.balance || 0) + amount,
          available_balance: (account?.available_balance || 0) + amount,
          total_deposits: (account?.total_deposits || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Account update error:', updateError)
        throw new Error('Failed to update account balance')
      }

      // Update local state
      setAccount(updatedAccount)
      
      // Update saved session
      const savedSession = localStorage.getItem('supabase-session')
      if (savedSession) {
        const session = JSON.parse(savedSession)
        session.account = updatedAccount
        localStorage.setItem('supabase-session', JSON.stringify(session))
      }
      
      console.log('✅ Funding processed successfully via Supabase')
      return { success: true, data: { new_balance: updatedAccount.balance } }
      
    } catch (error) {
      console.error('❌ Supabase funding error:', error)
      
      // Fallback to localStorage for demo mode
      if (account) {
        const updatedAccount = {
          ...account,
          balance: account.balance + amount,
          available_balance: account.available_balance + amount,
          total_deposits: account.total_deposits + amount
        }
        setAccount(updatedAccount)
        
        const savedSession = localStorage.getItem('supabase-session')
        if (savedSession) {
          const session = JSON.parse(savedSession)
          session.account = updatedAccount
          localStorage.setItem('supabase-session', JSON.stringify(session))
        }
        
        console.log('✅ Funding processed via localStorage fallback')
        return { success: true, data: { new_balance: updatedAccount.balance } }
      }
      
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email)
    
    try {
      // Check if user already exists
      const allUsers = JSON.parse(localStorage.getItem('hedge-fund-users') || '[]')
      const existingUser = allUsers.find((u: any) => u.email === email)
      
      if (existingUser) {
        return { 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.' 
          } 
        }
      }
      
      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        email: email,
        password: password, // In production, this would be hashed
        full_name: metadata?.full_name || 'New User',
        accountId: 'account-' + Date.now(),
        balance: 0.00,
        available_balance: 0.00,
        total_deposits: 0.00,
        total_withdrawals: 0.00,
        created_at: new Date().toISOString()
      }
      
      // Save user to localStorage (simulated database)
      allUsers.push(newUser)
      localStorage.setItem('hedge-fund-users', JSON.stringify(allUsers))
      
      // New users start with $0 balance
      const newAccount = {
        id: newUser.accountId,
        balance: 5000.00, // Give new users demo balance
        available_balance: 5000.00,
        total_deposits: 5000.00,
        total_withdrawals: 0.00,
        currency: 'USD',
        status: 'active'
      }
      
      const newSession = {
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          full_name: newUser.full_name 
        },
        account: newAccount,
        access_token: 'token-' + Date.now()
      }
      
      // Save session
      localStorage.setItem('supabase-session', JSON.stringify(newSession))
      setUser(newSession.user)
      setAccount(newAccount)
      
      console.log('✅ Sign up successful for:', email)
      return { error: null }
      
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { 
        error: { 
          message: 'Account creation failed. Please try again.' 
        } 
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    
    try {
      // Clear session
      localStorage.removeItem('supabase-session')
      setUser(null)
      setAccount(null)
      
      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    account,
    refreshAccount,
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