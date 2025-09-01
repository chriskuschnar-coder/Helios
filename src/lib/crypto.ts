import { ethers } from 'ethers'

export interface CryptoWallet {
  address: string
  privateKey: string
  currency: 'BTC' | 'ETH' | 'USDC' | 'USDT'
}

export interface CryptoDeposit {
  id: string
  user_id: string
  currency: string
  address: string
  amount: number
  confirmations: number
  required_confirmations: number
  status: 'pending' | 'confirmed' | 'failed'
  tx_hash: string
  created_at: string
}

// Supported cryptocurrencies
export const SUPPORTED_CRYPTO = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    minDeposit: 0.001,
    confirmations: 3,
    network: 'bitcoin'
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    minDeposit: 0.01,
    confirmations: 12,
    network: 'ethereum'
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    minDeposit: 10,
    confirmations: 12,
    network: 'ethereum',
    contractAddress: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e'
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    minDeposit: 10,
    confirmations: 12,
    network: 'ethereum',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
}

// Generate new Ethereum wallet
export const generateEthereumWallet = (): CryptoWallet => {
  const wallet = ethers.Wallet.createRandom()
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    currency: 'ETH'
  }
}

// Validate crypto address
export const validateCryptoAddress = (address: string, currency: string): boolean => {
  try {
    switch (currency) {
      case 'ETH':
      case 'USDC':
      case 'USDT':
        return ethers.utils.isAddress(address)
      case 'BTC':
        // Basic Bitcoin address validation (simplified)
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
      default:
        return false
    }
  } catch {
    return false
  }
}

// Get crypto network fee estimates
export const getCryptoFees = async (currency: string) => {
  // This would integrate with actual fee estimation APIs
  const fees = {
    BTC: { slow: 10, standard: 20, fast: 50 }, // satoshis per byte
    ETH: { slow: 20, standard: 40, fast: 80 }, // gwei
    USDC: { slow: 25, standard: 45, fast: 85 }, // gwei
    USDT: { slow: 25, standard: 45, fast: 85 }  // gwei
  }
  
  return fees[currency as keyof typeof fees] || fees.ETH
}