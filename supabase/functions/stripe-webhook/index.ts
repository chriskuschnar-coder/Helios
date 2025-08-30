import { createClient } from 'npm:@supabase/supabase-js@2'

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
    
    console.log('Received Stripe webhook with signature:', signature ? 'Present' : 'Missing')
    
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('Processing successful payment:', paymentIntent.id)
        
        // Extract user ID from metadata
        const userId = paymentIntent.metadata?.user_id
        const amount = paymentIntent.amount / 100 // Convert from cents
        
        if (!userId) {
          console.error('No user_id in payment metadata')
          throw new Error('Missing user ID in payment metadata')
        }

        // Update payment record
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            is_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (paymentUpdateError) {
          console.error('Error updating payment record:', paymentUpdateError)
        } else {
          console.log('✅ Payment record updated successfully')
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'deposit',
            method: 'stripe',
            amount: amount,
            status: 'completed',
            external_id: paymentIntent.id,
            description: `Card payment - ${paymentIntent.id}`,
            metadata: {
              stripe_payment_intent: paymentIntent.id,
              payment_method: paymentIntent.payment_method,
              currency: paymentIntent.currency
            }
          })

        if (transactionError) {
          console.error('Error creating transaction:', transactionError)
        } else {
          console.log('✅ Transaction record created')
        }

        // Get user's account
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (accountError) {
          console.error('Error fetching account:', accountError)
          throw accountError
        }

        // Update account balance
        const newBalance = (accountData.balance || 0) + amount
        const newAvailableBalance = (accountData.available_balance || 0) + amount
        const newTotalDeposits = (accountData.total_deposits || 0) + amount

        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            balance: newBalance,
            available_balance: newAvailableBalance,
            total_deposits: newTotalDeposits,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('Error updating account balance:', updateError)
          throw updateError
        }

        console.log(`✅ Payment processed successfully: $${amount} for user ${userId}`)
        console.log(`New balance: $${newBalance}`)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Processing failed payment:', failedPayment.id)
        
        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            is_paid: false,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', failedPayment.id)

        const failedUserId = failedPayment.metadata?.user_id
        if (failedUserId) {
          // Log failed payment transaction
          await supabase
            .from('transactions')
            .insert({
              user_id: failedUserId,
              type: 'deposit',
              method: 'stripe',
              amount: failedPayment.amount / 100,
              status: 'failed',
              external_id: failedPayment.id,
              description: `Failed card payment - ${failedPayment.id}`,
              metadata: {
                stripe_payment_intent: failedPayment.id,
                failure_reason: failedPayment.last_payment_error?.message
              }
            })
        }
        break

      case 'payment_intent.requires_action':
        console.log('Payment requires additional action:', event.data.object.id)
        
        // Update payment status to processing
        await supabase
          .from('payments')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', event.data.object.id)
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