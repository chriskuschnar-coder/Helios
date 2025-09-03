const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('🔔 BitPay webhook received')
    
    const body = await req.text()
    const event = JSON.parse(body)
    
    console.log('📦 Webhook event:', {
      id: event.id,
      status: event.status,
      price: event.price,
      currency: event.currency
    })

    // Verify webhook authenticity (you should implement proper verification)
    // For now, we'll process all webhooks
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle different BitPay statuses
    switch (event.status) {
      case 'paid':
      case 'confirmed':
      case 'complete':
        console.log('✅ Processing confirmed BitPay payment')
        
        // Extract user_id from posData
        let posData
        try {
          posData = JSON.parse(event.posData || '{}')
        } catch {
          posData = {}
        }
        
        const userId = posData.user_id
        if (!userId) {
          console.error('❌ No user_id found in BitPay posData')
          break
        }

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
        const paymentAmount = parseFloat(event.price)

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
            external_id: event.id,
            reference_id: event.orderId,
            description: `BitPay crypto payment - $${paymentAmount.toLocaleString()}`,
            metadata: {
              bitpay_invoice_id: event.id,
              bitpay_status: event.status,
              crypto_currency: posData.crypto_currency || 'unknown',
              bitpay_url: event.url
            }
          })
        })

        if (!transactionResponse.ok) {
          console.error('❌ Failed to create transaction record')
        } else {
          console.log('✅ Transaction record created')
        }

        break

      case 'expired':
      case 'invalid':
        console.log('⚠️ BitPay payment expired or invalid:', event.id)
        // Could update any pending payment records to failed status
        break

      default:
        console.log('ℹ️ BitPay status update:', event.status, 'for invoice:', event.id)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ BitPay webhook processing error:', error)
    
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