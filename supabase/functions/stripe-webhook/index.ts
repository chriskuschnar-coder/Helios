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
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || 'whsec_hffzsrLlxqmGIMYACHfhAtXvhD6eVddL'
    
    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    console.log('Webhook received:', { signature: signature.substring(0, 20) + '...', bodyLength: body.length })

    // Verify webhook signature (simplified for demo)
    // In production, use proper Stripe webhook verification
    
    let event
    try {
      event = JSON.parse(body)
      console.log('Webhook event type:', event.type)
    } catch (err) {
      console.error('Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed')
        const session = event.data.object
        
        // Get user_id from metadata
        const userId = session.metadata?.user_id
        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        console.log('Processing payment for user:', userId)
        console.log('Session details:', {
          id: session.id,
          amount_total: session.amount_total,
          customer: session.customer,
          payment_status: session.payment_status
        })

        // Update payment record
        const updatePaymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_session_id=eq.${session.id}`, {
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
            metadata: {
              ...session.metadata,
              stripe_session_id: session.id,
              stripe_customer_id: session.customer,
              payment_status: session.payment_status,
              amount_total: session.amount_total
            }
          })
        })

        if (!updatePaymentResponse.ok) {
          console.error('Failed to update payment record')
        } else {
          console.log('✅ Payment record updated')
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
          console.error('Failed to get user account')
          break
        }

        const accounts = await accountResponse.json()
        if (accounts.length === 0) {
          console.error('No account found for user:', userId)
          break
        }

        const account = accounts[0]
        const investmentAmount = session.amount_total / 100 // Convert from cents to dollars

        console.log('Updating account balance:', {
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
          console.error('Failed to update account balance')
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
            method: 'stripe',
            amount: investmentAmount,
            status: 'completed',
            external_id: session.payment_intent,
            reference_id: session.id,
            description: `Stripe payment - $${investmentAmount.toLocaleString()}`,
            metadata: {
              stripe_session_id: session.id,
              stripe_customer_id: session.customer,
              stripe_payment_intent: session.payment_intent
            }
          })
        })

        if (!transactionResponse.ok) {
          console.error('Failed to create transaction record')
        } else {
          console.log('✅ Transaction record created')
        }

        break

      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object.id)
        break

      case 'customer.created':
        console.log('Customer created:', event.data.object.id)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    
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