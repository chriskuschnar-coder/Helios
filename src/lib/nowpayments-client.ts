// Simplified NOWPayments client to avoid import issues
export interface NOWPaymentsInvoice {
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

export interface NOWPaymentsPayment {
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

// Simple API functions without class complexity
export const nowPaymentsAPI = {
  async getAvailableCurrencies(): Promise<string[]> {
    const response = await fetch('https://api.nowpayments.io/v1/currencies', {
      headers: {
        'x-api-key': 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
      }
    })

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.currencies
  },

  async getEstimatedPrice(amount: number, currency_from: string, currency_to: string): Promise<number> {
    const response = await fetch(
      `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}`,
      {
        headers: {
          'x-api-key': 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.estimated_amount
  },

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
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`NOWPayments API Error: ${error.message || response.statusText}`)
    }

    return await response.json()
  },

  async getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment> {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: {
        'x-api-key': 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
      }
    })

    if (!response.ok) {
      throw new Error(`NOWPayments API Error: ${response.statusText}`)
    }

    return await response.json()
  }
}

// Legacy export for backward compatibility
export const nowPaymentsClient = nowPaymentsAPI