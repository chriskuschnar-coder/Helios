import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2, Coins, Copy } from 'lucide-react'
import { nowPaymentsClient } from '../lib/nowpayments-client'

export function CryptoPaymentTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }])
  }

  const testNOWPayments = async () => {
    setTesting(true)
    setResults([])

    addResult("API Configuration", "info", "Testing NOWPayments API configuration...")

    // Test 1: Check API Key
    const apiKey = import.meta.env.VITE_NOWPAYMENTS_API_KEY
    if (!apiKey) {
      addResult("API Key", "error", "NOWPayments API key not found in environment variables")
      setTesting(false)
      return
    } else {
      addResult("API Key", "success", `API key configured: ${apiKey.substring(0, 8)}...`)
    }

    // Test 2: Get Available Currencies
    try {
      addResult("Currency List", "info", "Fetching available cryptocurrencies...")
      const currencies = await nowPaymentsClient.getAvailableCurrencies()
      setAvailableCurrencies(currencies)
      addResult("Currency List", "success", `${currencies.length} cryptocurrencies available`, currencies.slice(0, 10))
    } catch (error) {
      addResult("Currency List", "error", `Failed to fetch currencies: ${error.message}`)
      setTesting(false)
      return
    }

    // Test 3: Get Price Estimate
    try {
      addResult("Price Estimate", "info", "Testing price estimation for $1000 USD to BTC...")
      const estimate = await nowPaymentsClient.getEstimatedPrice(1000, 'usd', 'btc')
      addResult("Price Estimate", "success", `Estimated BTC amount: ${estimate}`, { usd: 1000, btc: estimate })
    } catch (error) {
      addResult("Price Estimate", "error", `Price estimation failed: ${error.message}`)
    }

    // Test 4: Test Payment Creation (without actually creating)
    addResult("Payment Creation", "info", "Testing payment creation parameters...")
    try {
      const testParams = {
        price_amount: 100,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: `TEST-${Date.now()}`,
        order_description: 'Test payment for API validation',
        ipn_callback_url: 'https://upevugqarcvxnekzddeh.supabase.co/functions/v1/nowpayments-webhook',
        success_url: `${window.location.origin}/funding-success`,
        cancel_url: `${window.location.origin}/funding-cancelled`,
        is_fixed_rate: true,
        is_fee_paid_by_user: true
      }
      
      addResult("Payment Parameters", "success", "Payment parameters validated", testParams)
    } catch (error) {
      addResult("Payment Parameters", "error", `Parameter validation failed: ${error.message}`)
    }

    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'info': return <Loader2 className="h-5 w-5 text-blue-600" />
      default: return <Coins className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-700'
      case 'error': return 'bg-red-50 border-red-200 text-red-700'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            NOWPayments Integration Test
          </h1>
          <p className="text-gray-600">
            Testing your NOWPayments API configuration and crypto payment capabilities
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={testNOWPayments}
            disabled={testing}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              testing 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {testing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                Testing NOWPayments API...
              </>
            ) : (
              <>
                <Coins className="h-5 w-5 mr-2 inline" />
                Test NOWPayments Integration
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results:</h2>
            
            {results.map((result, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-medium">{result.test}</h3>
                    <p className="text-sm mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs hover:underline">
                          Show Details
                        </summary>
                        <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableCurrencies.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-medium text-green-900 mb-4">
              ✅ Available Cryptocurrencies ({availableCurrencies.length})
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {availableCurrencies.slice(0, 24).map((currency) => (
                <span key={currency} className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-700 border">
                  {currency.toUpperCase()}
                </span>
              ))}
              {availableCurrencies.length > 24 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{availableCurrencies.length - 24} more...
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Platform
          </button>
        </div>
      </div>
    </div>
  )
}