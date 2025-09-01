import { PlaidLinkOptions } from 'react-plaid-link'

export const PLAID_CONFIG = {
  env: import.meta.env.PLAID_ENV || 'sandbox',
  publicKey: import.meta.env.VITE_PLAID_PUBLIC_KEY,
  clientName: 'Global Market Consulting',
  products: ['transactions', 'auth'],
  countryCodes: ['US'],
}

export interface PlaidAccount {
  account_id: string
  balances: {
    available: number | null
    current: number | null
    limit: number | null
  }
  mask: string
  name: string
  official_name: string
  subtype: string
  type: string
}

export interface PlaidLinkSuccess {
  public_token: string
  metadata: {
    institution: {
      name: string
      institution_id: string
    }
    accounts: PlaidAccount[]
    link_session_id: string
  }
}

export interface PlaidBankTransfer {
  id: string
  user_id: string
  account_id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ach_class: string
  created_at: string
}

export const createPlaidLinkConfig = (
  linkToken: string,
  onSuccess: (publicToken: string, metadata: any) => void,
  onExit?: (err: any, metadata: any) => void
): PlaidLinkOptions => ({
  token: linkToken,
  onSuccess,
  onExit,
  onEvent: (eventName, metadata) => {
    console.log('Plaid Link Event:', eventName, metadata)
  },
})