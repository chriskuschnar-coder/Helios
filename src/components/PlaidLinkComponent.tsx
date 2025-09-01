'use client'

import { usePlaidLink } from 'react-plaid-link'
import { useState } from 'react'
import { CreditCard, Shield, CheckCircle } from 'lucide-react'

interface PlaidLinkComponentProps {
  onSuccess: (publicToken: string, metadata: any) => void
  onExit?: (err: any, metadata: any) => void
  amount: number
}

export function PlaidLinkComponent({ onSuccess, onExit, amount }: PlaidLinkComponentProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, you'd get this from your backend
  const createLinkToken = async () => {
    setIsLoading(true)
    try {
      // This would be a call to your backend API
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo-user',
          client_name: 'Helios Capital',
        }),
      })
      
      if (!response.ok) {
        // For demo purposes, use a mock token
        setLinkToken('link-sandbox-mock-token')
        return
      }
      
      const data = await response.json()
      setLinkToken(data.link_token)
    } catch (error) {
      console.error('Error creating link token:', error)
      // For demo purposes, use a mock token
      setLinkToken('link-sandbox-mock-token')
    } finally {
      setIsLoading(false)
    }
  }

  const config = {
    token: linkToken,
    onSuccess: (publicToken: string, metadata: any) => {
      console.log('Plaid Link Success:', { publicToken, metadata })
      onSuccess(publicToken, metadata)
    },
    onExit: (err: any, metadata: any) => {
      console.log('Plaid Link Exit:', { err, metadata })
      if (onExit) onExit(err, metadata)
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Plaid Link Event:', eventName, metadata)
    },
  }

  const { open, ready } = usePlaidLink(config)

  const handleConnect = async () => {
    if (!linkToken) {
      await createLinkToken()
    }
    if (ready) {
      open()
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="h-5 w-5 text-green-400" />
          <span className="text-sm font-medium text-white">Secure Bank Connection</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Connect your bank account securely through Plaid. Your login credentials are never stored.
        </p>
        
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span>Bank-level 256-bit encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span>Read-only access to account information</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span>Supports 11,000+ financial institutions</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Transfer Amount</span>
          <span className="text-lg font-bold text-white">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Processing Time</span>
          <span className="text-sm text-white">1-3 business days</span>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={isLoading || (!ready && linkToken)}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <CreditCard className="h-5 w-5" />
        <span>
          {isLoading ? 'Initializing...' : 'Connect Bank Account'}
        </span>
      </button>

      <p className="text-xs text-gray-500 text-center">
        By connecting your account, you agree to Plaid's{' '}
        <a href="https://plaid.com/legal/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="https://plaid.com/legal/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
          Terms of Service
        </a>
      </p>
    </div>
  )
}