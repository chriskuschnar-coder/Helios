interface BitPayInvoice {
  id: string
  url: string
  status: string
  price: number
  currency: string
  paymentCurrencies: Array<{
    code: string
    total: number
    subtotal: number
    displayTotal: string
    displaySubtotal: string
    exchangeRate: number
    minerFee: number
    paymentAddress: string
    paymentString: string
  }>
  expirationTime: number
  currentTime: number
  acceptanceWindow: number
  buyer?: {
    name?: string
    email?: string
  }
  redirectURL?: string
  notificationURL?: string
  transactionSpeed: string
  fullNotifications: boolean
  extendedNotifications: boolean
  posData?: string
  paymentSubtotals?: any
  paymentTotals?: any
  amountPaid?: number
  exchangeRates?: any
}

interface BitPayConfig {
  apiToken: string
  environment: 'test' | 'prod'
  notificationUrl?: string
  redirectUrl?: string
}

class BitPayClient {
  private config: BitPayConfig
  private baseUrl: string

  constructor(config: BitPayConfig) {
    this.config = config
    this.baseUrl = config.environment === 'prod' 
      ? 'https://bitpay.com/api' 
      : 'https://test.bitpay.com/api'
  }

  async createInvoice(params: {
    price: number
    currency: string
    orderId?: string
    buyerEmail?: string
    buyerName?: string
    redirectURL?: string
    notificationURL?: string
    posData?: any
  }): Promise<BitPayInvoice> {
    const invoiceData = {
      price: params.price,
      currency: params.currency,
      orderId: params.orderId || `GMC-${Date.now()}`,
      buyer: {
        email: params.buyerEmail,
        name: params.buyerName
      },
      redirectURL: params.redirectURL || this.config.redirectUrl,
      notificationURL: params.notificationURL || this.config.notificationUrl,
      posData: JSON.stringify(params.posData || {}),
      transactionSpeed: 'medium', // medium = 1 confirmation
      fullNotifications: true,
      extendedNotifications: true,
      acceptanceWindow: 1200000 // 20 minutes in milliseconds
    }

    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiToken}`,
        'X-Accept-Version': '2.0.0'
      },
      body: JSON.stringify(invoiceData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`BitPay API Error: ${error.error || response.statusText}`)
    }

    const invoice = await response.json()
    return invoice.data
  }

  async getInvoice(invoiceId: string): Promise<BitPayInvoice> {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'X-Accept-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`BitPay API Error: ${error.error || response.statusText}`)
    }

    const invoice = await response.json()
    return invoice.data
  }

  getPaymentUrl(invoice: BitPayInvoice): string {
    return invoice.url
  }

  getPaymentAddress(invoice: BitPayInvoice, cryptocurrency: string): string | null {
    const paymentCurrency = invoice.paymentCurrencies?.find(
      pc => pc.code.toLowerCase() === cryptocurrency.toLowerCase()
    )
    return paymentCurrency?.paymentAddress || null
  }

  getPaymentAmount(invoice: BitPayInvoice, cryptocurrency: string): number | null {
    const paymentCurrency = invoice.paymentCurrencies?.find(
      pc => pc.code.toLowerCase() === cryptocurrency.toLowerCase()
    )
    return paymentCurrency?.total || null
  }
}

// Environment variables - you'll need to set these
const BITPAY_CONFIG: BitPayConfig = {
  apiToken: import.meta.env.VITE_BITPAY_API_TOKEN || '',
  environment: (import.meta.env.VITE_BITPAY_ENVIRONMENT as 'test' | 'prod') || 'test',
  notificationUrl: `${window.location.origin}/api/bitpay-webhook`,
  redirectUrl: `${window.location.origin}/funding-success`
}

export const bitPayClient = new BitPayClient(BITPAY_CONFIG)
export type { BitPayInvoice }