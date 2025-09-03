interface NOWPaymentsInvoice {
  id: string
  token_id: string
  order_id: string
  order_description: string
  price_amount: number
  price_currency: string
  pay_currency: string
  ipn_callback_url: string
  invoice_url: string
  success_url: string
  cancel_url: string
  partially_paid_url: string
  payout_currency: string
  created_at: string
  updated_at: string
  is_fixed_rate: boolean
  is_fee_paid_by_user: boolean
}

interface NOWPaymentsPayment {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  purchase_id: string
  outcome_amount: number
  outcome_currency: string
  payout_hash: string
  payin_hash: string
  created_at: string
  updated_at: string
  burning_percent: number
  type: string
}

interface NOWPaymentsConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
  ipnSecret?: string
}

class NOWPaymentsClient {
  private config: NOWPaymentsConfig
  private baseUrl: string

  constructor(config: NOWPaymentsConfig) {
    this.config = config
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.nowpayments.io/v1' 
      : 'https://api-sandbox.nowpayments.io/v1'
  }

  async getAvailableCurrencies(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/currencies`, {
      headers: {
        'x-api-key': this.config.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.currencies
  }

  async getEstimatedPrice(amount: number, currency_from: string, currency_to: string): Promise<number> {
    const response = await fetch(
      `${this.baseUrl}/estimate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}`,
      {
        headers: {
          'x-api-key': this.config.apiKey
        }
      }
    )

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.estimated_amount
  }

  async createPayment(params: {
    price_amount: number
    price_currency: string
    pay_currency: string
    order_id: string
    order_description: string
    ipn_callback_url: string
    success_url: string
    cancel_url: string
    customer_email?: string
    purchase_id?: string
    payout_address?: string
    payout_currency?: string
    payout_extra_id?: string
    fixed_rate?: boolean
    is_fee_paid_by_user?: boolean
  }): Promise<NOWPaymentsPayment> {
    const response = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`NOWPayments API Error: ${error.message || response.statusText}`)
    }

    return await response.json()
  }

  async createInvoice(params: {
    price_amount: number
    price_currency: string
    order_id: string
    order_description: string
    ipn_callback_url: string
    success_url: string
    cancel_url: string
    customer_email?: string
    is_fixed_rate?: boolean
    is_fee_paid_by_user?: boolean
  }): Promise<NOWPaymentsInvoice> {
    const response = await fetch(`${this.baseUrl}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`NOWPayments API Error: ${error.message || response.statusText}`)
    }

    return await response.json()
  }

  async getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment> {
    const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
      headers: {
        'x-api-key': this.config.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    return await response.json()
  }

  async getInvoiceStatus(invoiceId: string): Promise<NOWPaymentsInvoice> {
    const response = await fetch(`${this.baseUrl}/invoice/${invoiceId}`, {
      headers: {
        'x-api-key': this.config.apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    return await response.json()
  }

  verifyIPN(payload: string, signature: string): boolean {
    if (!this.config.ipnSecret) {
      console.warn('IPN Secret not configured - skipping verification')
      return true
    }

    // Implement HMAC verification for IPN callbacks
    // This would use crypto.subtle.importKey and crypto.subtle.sign
    // For now, return true (implement proper verification in production)
    return true
  }
}

// Environment configuration
const NOWPAYMENTS_CONFIG: NOWPaymentsConfig = {
  apiKey: import.meta.env.VITE_NOWPAYMENTS_API_KEY || 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6',
  environment: (import.meta.env.VITE_NOWPAYMENTS_ENVIRONMENT as 'sandbox' | 'production') || 'production',
  ipnSecret: import.meta.env.VITE_NOWPAYMENTS_IPN_SECRET
}

export const nowPaymentsClient = new NOWPaymentsClient(NOWPAYMENTS_CONFIG)
export type { NOWPaymentsInvoice, NOWPaymentsPayment }