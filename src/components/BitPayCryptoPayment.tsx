import React, { useState } from 'react'
import { Coins, Copy, CheckCircle, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react'
import { bitPayClient } from '../lib/bitpay-client'

interface BitPayCryptoPaymentProps {
  amount: number
  userId?: string
  onSuccess: (invoice: any) => void
  onError: (error: string) => void
  onBack: () => void
}

export function BitPayCryptoPayment({ amount, userId, onSuccess, onError, onBack }: BitPayCryptoPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<any>(null)
  const [copiedField, setCopiedField] = useState('')

  const createBitPayInvoice = async () => {
    if (!userId) {
      onError('User not authenticated')
      return
    }

    setLoading(true)

    try {
      console.log('🔗 Creating BitPay invoice for amount:', amount)
      
      const invoiceParams = {
        price: amount,
        currency: 'USD',
        orderId: `GMC-${userId}-${Date.now()}`,
        buyerEmail: '', // Will be filled from user data
        buyerName: '', // Will be filled from user data
        redirectURL: `${window.location.origin}/funding-success`,
        notificationURL: `${window.location.origin}/api/bitpay-webhook`,
        posData: {
          user_id: userId,
          investment_amount: amount,
          platform: 'global_market_consulting'
        }
      }

      const newInvoice = await bitPayClient.createInvoice(invoiceParams)
      console.log('✅ BitPay invoice created:', newInvoice.id)
      
      setInvoice(newInvoice)
      onSuccess(newInvoice)
    } catch (error) {
      console.error('❌ BitPay invoice creation failed:', error)
      onError(error instanceof Error ? error.message : 'Failed to create crypto payment')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const openBitPayPage = () => {
    if (invoice?.url) {
      window.open(invoice.url, '_blank')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Payment Methods
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="h-8 w-8 text-navy-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cryptocurrency Payment</h3>
        <p className="text-gray-600">
          Secure crypto payment processing via BitPay for ${amount.toLocaleString()}
        </p>
      </div>

      {!invoice ? (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Coins className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">BitPay Crypto Processing</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• <strong>Supported:</strong> Bitcoin, Ethereum, Bitcoin Cash, Litecoin, Dogecoin</li>
              <li>• <strong>Security:</strong> Enterprise-grade payment processing</li>
              <li>• <strong>Confirmation:</strong> Automatic balance update upon payment</li>
              <li>• <strong>Support:</strong> 24/7 BitPay customer service</li>
            </ul>
          </div>

          <button
            onClick={createBitPayInvoice}
            disabled={loading}
            className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Crypto Payment...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Create Crypto Payment Invoice
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Payment Invoice Created</span>
            </div>
            <p className="text-sm text-green-700">
              Your BitPay invoice has been created. You can pay with any supported cryptocurrency.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Invoice ID</span>
                <button
                  onClick={() => copyToClipboard(invoice.id, 'invoice')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copiedField === 'invoice' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
              <div className="font-mono text-sm text-gray-900">{invoice.id}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">${invoice.price.toLocaleString()} USD</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-700 font-medium">Awaiting Payment</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Expires</span>
              </div>
              <div className="text-gray-900">
                {new Date(invoice.expirationTime).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={openBitPayPage}
              className="w-full bg-navy-600 hover:bg-navy-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open BitPay Payment Page
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Payment Instructions</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Click "Open BitPay Payment Page" to complete your payment</li>
                <li>• Choose from Bitcoin, Ethereum, Bitcoin Cash, Litecoin, or Dogecoin</li>
                <li>• Your account will be updated automatically upon confirmation</li>
                <li>• Payment expires in 20 minutes</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}