import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database Types
export interface User {
  id: string
  email: string
  created_at: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  two_factor_enabled: boolean
  last_login: string
}

export interface Account {
  id: string
  user_id: string
  balance: number
  available_balance: number
  total_deposits: number
  total_withdrawals: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  type: 'deposit' | 'withdrawal' | 'fee' | 'interest'
  method: 'stripe' | 'plaid' | 'crypto' | 'wire'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  external_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ComplianceRecord {
  id: string
  user_id: string
  provider: 'jumio' | 'onfido' | 'manual'
  verification_type: 'identity' | 'address' | 'income'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  data_blob: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CryptoAddress {
  id: string
  user_id: string
  currency: 'BTC' | 'ETH' | 'USDC' | 'USDT'
  address: string
  is_active: boolean
  created_at: string
}