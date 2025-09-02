const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔔 Crypto webhook received')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const webhookData = await req.json()
    console.log('📦 Webhook data:', webhookData)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle different webhook events
    switch (webhookData.type) {
      case 'crypto_payment_detected':
        await handleCryptoPaymentDetected(webhookData.data, supabaseUrl, supabaseServiceKey)
        break
      
      case 'crypto_payment_confirmed':
        await handleCryptoPaymentConfirmed(webhookData.data, supabaseUrl, supabaseServiceKey)
        break
        
      default:
        console.log('ℹ️ Unhandled webhook type:', webhookData.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
})

async function handleCryptoPaymentDetected(data: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('💰 Processing crypto payment detection:', data)
  
  const { payment_address, transaction_hash, amount, confirmations } = data
  
  // Find the payment invoice
  const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?payment_address=eq.${payment_address}&status=eq.pending`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!invoiceResponse.ok) {
    console.error('❌ Failed to fetch invoice')
    return
  }

  const invoices = await invoiceResponse.json()
  if (invoices.length === 0) {
    console.log('⚠️ No pending invoice found for address:', payment_address)
    return
  }

  const invoice = invoices[0]
  console.log('📋 Found invoice:', invoice.id)

  // Update invoice with payment detection
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?id=eq.${invoice.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      status: confirmations >= getRequiredConfirmations(invoice.cryptocurrency) ? 'confirmed' : 'partial',
      transaction_hash: transaction_hash,
      confirmations: confirmations,
      paid_at: confirmations >= getRequiredConfirmations(invoice.cryptocurrency) ? new Date().toISOString() : null,
      metadata: {
        ...invoice.metadata,
        detected_amount: amount,
        detection_time: new Date().toISOString()
      }
    })
  })

  if (!updateResponse.ok) {
    console.error('❌ Failed to update invoice')
    return
  }

  console.log('✅ Invoice updated with payment detection')

  // If confirmed, process the payment
  if (confirmations >= getRequiredConfirmations(invoice.cryptocurrency)) {
    await processCryptoPayment(invoice, supabaseUrl, supabaseServiceKey)
  }
}

async function handleCryptoPaymentConfirmed(data: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('✅ Processing crypto payment confirmation:', data)
  
  const { transaction_hash } = data
  
  // Find the payment invoice by transaction hash
  const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?transaction_hash=eq.${transaction_hash}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!invoiceResponse.ok) {
    console.error('❌ Failed to fetch invoice by hash')
    return
  }

  const invoices = await invoiceResponse.json()
  if (invoices.length === 0) {
    console.log('⚠️ No invoice found for transaction hash:', transaction_hash)
    return
  }

  const invoice = invoices[0]
  
  if (invoice.status === 'confirmed') {
    console.log('ℹ️ Payment already confirmed')
    return
  }

  // Update to confirmed status
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/crypto_payment_invoices?id=eq.${invoice.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      status: 'confirmed',
      paid_at: new Date().toISOString(),
      confirmations: data.confirmations || 999
    })
  })

  if (!updateResponse.ok) {
    console.error('❌ Failed to update invoice to confirmed')
    return
  }

  console.log('✅ Invoice confirmed, processing payment...')
  await processCryptoPayment(invoice, supabaseUrl, supabaseServiceKey)
}

async function processCryptoPayment(invoice: any, supabaseUrl: string, supabaseServiceKey: string) {
  console.log('💳 Processing crypto payment for invoice:', invoice.id)
  
  try {
    // Get user's account
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${invoice.user_id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!accountResponse.ok) {
      console.error('❌ Failed to get user account')
      return
    }

    const accounts = await accountResponse.json()
    if (accounts.length === 0) {
      console.error('❌ No account found for user:', invoice.user_id)
      return
    }

    const account = accounts[0]
    const investmentAmount = invoice.amount_usd

    console.log('💰 Updating account balance:', {
      currentBalance: account.balance,
      investmentAmount: investmentAmount,
      newBalance: account.balance + investmentAmount
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
        balance: account.balance + investmentAmount,
        available_balance: account.available_balance + investmentAmount,
        total_deposits: account.total_deposits + investmentAmount
      })
    })

    if (!updateAccountResponse.ok) {
      console.error('❌ Failed to update account balance')
      return
    }

    console.log('✅ Account balance updated successfully')

    // Create transaction record for the transactions tab
    const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: invoice.user_id,
        account_id: account.id,
        type: 'deposit',
        method: 'crypto',
        amount: investmentAmount,
        status: 'completed',
        external_id: invoice.transaction_hash,
        reference_id: invoice.id,
        description: `${invoice.cryptocurrency} payment - ${invoice.crypto_amount} ${invoice.cryptocurrency}`,
        metadata: {
          cryptocurrency: invoice.cryptocurrency,
          crypto_amount: invoice.crypto_amount,
          payment_address: invoice.payment_address,
          transaction_hash: invoice.transaction_hash,
          confirmations: invoice.confirmations,
          exchange_rate: invoice.metadata?.exchange_rate
        }
      })
    })

    if (!transactionResponse.ok) {
      console.error('❌ Failed to create transaction record')
    } else {
      console.log('✅ Transaction record created for transactions tab')
    }

    console.log('🎉 Crypto payment processing completed successfully')

  } catch (error) {
    console.error('❌ Error processing crypto payment:', error)
  }
}

function getRequiredConfirmations(cryptocurrency: string): number {
  switch (cryptocurrency) {
    case 'BTC': return 3
    case 'ETH': return 12
    case 'USDT': return 12
    case 'SOL': return 1
    default: return 6
  }
}