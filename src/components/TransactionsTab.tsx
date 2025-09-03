import React, { useState, useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import { ArrowUpRight, ArrowDownLeft, CreditCard, Building, Zap, Coins, ExternalLink, Calendar, Filter } from 'lucide-react'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'fee' | 'interest' | 'trade'
  method: 'stripe' | 'plaid' | 'crypto' | 'wire' | 'internal'
  amount: number
  fee: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  description: string
  external_id?: string
  reference_id?: string
  metadata: any
  created_at: string
  updated_at: string
}

export function TransactionsTab() {
  const { user, account } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all')

  useEffect(() => {
    if (user && account) {
      loadTransactions()
    }
  }, [user, account])

  const loadTransactions = async () => {
    try {
      const { supabaseClient } = await import('../lib/supabase-client')
      
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe': return CreditCard
      case 'crypto': return Coins
      case 'wire': return Zap
      case 'plaid': return Building
      default: return CreditCard
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'stripe': return 'Credit Card'
      case 'crypto': return 'Cryptocurrency'
      case 'wire': return 'Wire Transfer'
      case 'plaid': return 'Bank Transfer'
      default: return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    if (filter === 'deposits') return transaction.type === 'deposit'
    if (filter === 'withdrawals') return transaction.type === 'withdrawal'
    return true
  })

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-navy-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Transaction History</h3>
            <p className="text-sm text-gray-600">All account activity and payments</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          >
            <option value="all">All Transactions</option>
            <option value="deposits">Deposits Only</option>
            <option value="withdrawals">Withdrawals Only</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">No Transactions Yet</h4>
          <p className="text-gray-600">Your transaction history will appear here once you make your first deposit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const MethodIcon = getMethodIcon(transaction.method)
            const isDeposit = transaction.type === 'deposit'
            
            return (
              <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDeposit ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isDeposit ? (
                        <ArrowDownLeft className="h-6 w-6 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} via ${getMethodName(transaction.method)}`}
                        </h4>
                        <MethodIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                        <span>{new Date(transaction.created_at).toLocaleTimeString()}</span>
                        
                        {transaction.external_id && (
                          <div className="flex items-center space-x-1">
                            <span>ID: {transaction.external_id.substring(0, 8)}...</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        )}
                        
                        {transaction.metadata?.cryptocurrency && (
                          <span className="font-medium text-navy-600">
                            {transaction.metadata.cryptocurrency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isDeposit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isDeposit ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                      
                      {transaction.fee > 0 && (
                        <span className="text-xs text-gray-500">
                          Fee: ${transaction.fee.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Details for Crypto Transactions */}
                {transaction.method === 'crypto' && transaction.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {transaction.metadata.crypto_amount && (
                        <div>
                          <span className="font-medium">Crypto Amount:</span>
                          <div className="font-mono">{transaction.metadata.crypto_amount} {transaction.metadata.cryptocurrency}</div>
                        </div>
                      )}
                      {transaction.metadata.exchange_rate && (
                        <div>
                          <span className="font-medium">Exchange Rate:</span>
                          <div>${transaction.metadata.exchange_rate.toLocaleString()}</div>
                        </div>
                      )}
                      {transaction.metadata.transaction_hash && (
                        <div className="col-span-2">
                          <span className="font-medium">Transaction Hash:</span>
                          <div className="font-mono break-all">{transaction.metadata.transaction_hash}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}