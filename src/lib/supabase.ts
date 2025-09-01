import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserAccount {
  id: string
  user_id: string
  account_type: 'trading' | 'savings'
  balance: number
  available_balance: number
  currency: string
  status: 'active' | 'frozen' | 'closed'
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'interest'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  reference_id?: string
  description: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BankAccount {
  id: string
  user_id: string
  plaid_account_id: string
  plaid_access_token: string
  account_name: string
  account_type: string
  account_subtype: string
  mask: string
  institution_name: string
  is_verified: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}