const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('🔔 NOWPayments webhook received')
    
    const signature = req.headers.get('x-nowpayments-sig')
    const body = await req.text()
    
    console.log('📦 Webhook details:', {
      signature: signature?.substring(0, 20) + '...',
      bodyLength: body.length
    })

    // Parse the webhook payload
    let event
    try {
      event = JSON.parse(body)
      console.log('📦 Webhook event:', {
        payment_id: event.payment_id,
        payment_status: event.payment_status,
        price_amount: event.price_amount,
        price_currency: event.price_currency,
        pay_currency: event.pay_currency,
        order_id: event.order_id
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    // Verify webhook signature (implement proper HMAC verification in production)
    const ipnSecret = 'T8kk7npqjaovmsRdbeO2VbnSHESmFS7Y'
    if (ipnSecret && signature) {
      // Verify HMAC-SHA512 signature
      const encoder = new TextEncoder()
      const keyData = encoder.encode(ipnSecret)
      const messageData = encoder.encode(body)
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      )
      
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      if (signature !== computedSignature) {
        console.error('❌ Invalid webhook signature')
        return new Response('Invalid signature', { status: 401 })
      }
      
      console.log('✅ Webhook signature verified')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle different NOWPayments statuses
    switch (event.payment_status) {
      case 'finished':
      case 'confirmed':
        console.log('✅ Processing confirmed NOWPayments payment')
        
        // Extract user_id from order_id (format: GMC-{user_id}-{timestamp})
        const orderParts = event.order_id.split('-')
        if (orderParts.length < 2 || orderParts[0] !== 'GMC') {
          console.error('❌ Invalid order_id format:', event.order_id)
          break
        }
        
        const userId = orderParts[1]
        console.log('👤 Processing payment for user:', userId)
        
        // Get user's account
        const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!accountResponse.ok) {
          console.error('❌ Failed to get user account')
          break
        }

        const accounts = await accountResponse.json()
        if (accounts.length === 0) {
          console.error('❌ No account found for user:', userId)
          break
        }

        const account = accounts[0]
        const paymentAmount = parseFloat(event.price_amount)

        console.log('💰 Updating account balance:', {
          currentBalance: account.balance,
          paymentAmount: paymentAmount,
          newBalance: account.balance + paymentAmount
        })

        // Update account balance
        const updateAccountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${account.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            balance: account.balance + paymentAmount,
            available_balance: account.available_balance + paymentAmount,
            total_deposits: account.total_deposits + paymentAmount
          })
        })

        if (!updateAccountResponse.ok) {
          console.error('❌ Failed to update account balance')
        } else {
          console.log('✅ Account balance updated successfully')
        }

        // Create transaction record
        const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            account_id: account.id,
            type: 'deposit',
            method: 'crypto',
            amount: paymentAmount,
            status: 'completed',
            external_id: event.payment_id,
            reference_id: event.order_id,
            description: `NOWPayments crypto payment - ${event.pay_currency} - $${paymentAmount.toLocaleString()}`,
            metadata: {
              nowpayments_payment_id: event.payment_id,
              nowpayments_status: event.payment_status,
              crypto_currency: event.pay_currency,
              crypto_amount: event.pay_amount,
              payin_hash: event.payin_hash,
              payout_hash: event.payout_hash
            }
          })
        })

        if (!transactionResponse.ok) {
          console.error('❌ Failed to create transaction record')
        } else {
          console.log('✅ Transaction record created')
        }

        break

      case 'partially_paid':
        console.log('⚠️ NOWPayments partial payment received:', event.payment_id)
        // Could implement partial payment handling here
        break

      case 'failed':
      case 'expired':
        console.log('❌ NOWPayments payment failed/expired:', event.payment_id)
        
        // Update any pending payment records to failed status
        const failedUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/payments?external_id=eq.${event.payment_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'failed'
          })
        })

        if (failedUpdateResponse.ok) {
          console.log('✅ Payment record marked as failed')
        }
        break

      case 'waiting':
      case 'confirming':
        console.log('ℹ️ NOWPayments status update:', event.payment_status, 'for payment:', event.payment_id)
        // Could update payment status in database for tracking
        break

      default:
        console.log('ℹ️ Unknown NOWPayments status:', event.payment_status, 'for payment:', event.payment_id)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ NOWPayments webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})