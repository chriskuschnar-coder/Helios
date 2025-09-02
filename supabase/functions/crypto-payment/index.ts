const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface CryptoRates {
  BTC: number
  ETH: number
  USDT: number
  SOL: number
}

// Mock crypto rates - in production, fetch from CoinGecko or similar
const getCurrentCryptoRates = async (): Promise<CryptoRates> => {
  // In production, fetch real rates from API
  return {
    BTC: 106250.00,
    ETH: 3195.00,
    USDT: 1.00,
    SOL: 245.00
  }
}

const generatePaymentAddress = (cryptocurrency: string, userId: string): string => {
  // Generate deterministic addresses based on user ID and crypto type
  // In production, use proper HD wallet derivation
  const seed = `${userId}-${cryptocurrency}-${Date.now()}`
  const hash = btoa(seed).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
  
  switch (cryptocurrency) {
    case 'BTC':
      return `bc1q${hash.toLowerCase().substring(0, 39)}`
    case 'ETH':
    case 'USDT':
      return `0x${hash.substring(0, 40)}`
    case 'SOL':
      return `${hash}${hash.substring(0, 12)}`
    default:
      throw new Error('Unsupported cryptocurrency')
  }
}

Deno.serve(async (req) => {
  console.log('🚀 Crypto payment function called:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT and get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Invalid user token')
    }
    
    const user = await userResponse.json()
    console.log('✅ User authenticated:', user.email)

    if (req.method === 'POST') {
      const { amount_usd, cryptocurrency } = await req.json()
      
      console.log('💰 Creating crypto payment invoice:', { amount_usd, cryptocurrency, user_id: user.id })
      
      // Validate inputs
      if (!amount_usd || amount_usd < 100) {
        throw new Error('Minimum investment amount is $100')
      }
      
      if (!['BTC', 'ETH', 'USDT', 'SOL'].includes(cryptocurrency)) {
        throw new Error('Unsupported cryptocurrency')
      }

      // Get current crypto rates
      const rates = await getCurrentCryptoRates()
      const cryptoAmount = amount_usd / rates[cryptocurrency as keyof CryptoRates]
      
      // Generate payment address
      const paymentAddress = generatePaymentAddress(cryptocurrency, user.id)
      
      // Set expiration (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      
      console.log('📝 Creating payment invoice in database...')
      
      // Create payment invoice in database
      const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: user.id,
          amount_usd: amount_usd,
          cryptocurrency: cryptocurrency,
          crypto_amount: cryptoAmount,
          payment_address: paymentAddress,
          status: 'pending',
          expires_at: expiresAt,
          metadata: {
            exchange_rate: rates[cryptocurrency as keyof CryptoRates],
            created_via: 'funding_modal',
            user_email: user.email
          }
        })
      })

      if (!invoiceResponse.ok) {
        const error = await invoiceResponse.json()
        console.error('❌ Database error:', error)
        throw new Error('Failed to create payment invoice')
      }

      const invoice = await invoiceResponse.json()
      console.log('✅ Payment invoice created:', invoice[0]?.id)

      return new Response(JSON.stringify({
        invoice_id: invoice[0]?.id,
        payment_address: paymentAddress,
        crypto_amount: cryptoAmount,
        cryptocurrency: cryptocurrency,
        amount_usd: amount_usd,
        expires_at: expiresAt,
        exchange_rate: rates[cryptocurrency as keyof CryptoRates]
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

    // GET request - check payment status
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const invoiceId = url.searchParams.get('invoice_id')
      
      if (!invoiceId) {
        throw new Error('Invoice ID required')
      }

      console.log('🔍 Checking payment status for invoice:', invoiceId)
      
      const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?id=eq.${invoiceId}&user_id=eq.${user.id}`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!invoiceResponse.ok) {
        throw new Error('Failed to fetch invoice')
      }

      const invoices = await invoiceResponse.json()
      if (invoices.length === 0) {
        throw new Error('Invoice not found')
      }

      const invoice = invoices[0]
      
      // In production, this would check blockchain for actual payments
      // For now, return the current status
      return new Response(JSON.stringify({
        status: invoice.status,
        confirmations: invoice.confirmations,
        transaction_hash: invoice.transaction_hash,
        paid_at: invoice.paid_at
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }

  } catch (error) {
    console.error('❌ Crypto payment error:', error)
    
    return new Response(JSON.stringify({ 
      error: { 
        message: error.message || 'Unknown error occurred',
        type: 'crypto_payment_error'
      }
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
})