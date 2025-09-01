const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    console.log('Received Stripe webhook')
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Parse webhook event
    let event
    try {
      event = JSON.parse(body)
      console.log('Webhook event type:', event.type)
    } catch (e) {
      console.error('Invalid JSON in webhook body')
      throw new Error('Invalid webhook payload')
    }

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Processing completed checkout session:', session.id)
        
        const userId = session.metadata?.user_id
        const amount = session.amount_total / 100 // Convert from cents
        
        if (!userId) {
          console.error('No user_id in session metadata')
          throw new Error('Missing user ID in session metadata')
        }

        // Update payment record
        const paymentUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_session_id=eq.${session.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'completed',
            is_paid: true,
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString()
          })
        })

        if (!paymentUpdateResponse.ok) {
          console.error('Error updating payment record')
        } else {
          console.log('✅ Payment record updated successfully')
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
            type: 'deposit',
            method: 'stripe',
            amount: amount,
            status: 'completed',
            external_id: session.id,
            description: `Hedge fund investment - ${session.id}`,
            metadata: {
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
              investment_type: 'hedge_fund_capital'
            }
          })
        })

        if (!transactionResponse.ok) {
          console.error('Error creating transaction record')
        } else {
          console.log('✅ Transaction record created')
        }

        // Get user's account
        const accountResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!accountResponse.ok) {
          console.error('Error fetching account')
          throw new Error('Failed to fetch account')
        }

        const accounts = await accountResponse.json()
        const account = accounts[0]

        if (!account) {
          console.error('No account found for user:', userId)
          throw new Error('Account not found')
        }

        // Update account balance
        const newBalance = (account.balance || 0) + amount
        const newAvailableBalance = (account.available_balance || 0) + amount
        const newTotalDeposits = (account.total_deposits || 0) + amount

        const balanceUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            balance: newBalance,
            available_balance: newAvailableBalance,
            total_deposits: newTotalDeposits,
            updated_at: new Date().toISOString()
          })
        })

        if (!balanceUpdateResponse.ok) {
          console.error('Error updating account balance')
          throw new Error('Failed to update account balance')
        }

        console.log(`✅ Investment processed successfully: $${amount} for user ${userId}`)
        console.log(`New balance: $${newBalance}`)
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object
        console.log('Processing expired checkout session:', expiredSession.id)
        
        // Update payment record to expired
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_session_id=eq.${expiredSession.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
        })
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ 
      received: true,
      event_type: event.type 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        received: false 
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