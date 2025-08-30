import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify webhook signature (in production)
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
    // const event = stripe.webhooks.constructEvent(body, signature!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)

    // For now, parse the event directly
    const event = JSON.parse(body)

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        
        // Extract user ID from metadata
        const userId = paymentIntent.metadata?.user_id
        const amount = paymentIntent.amount / 100 // Convert from cents
        
        if (userId) {
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
              description: `Card payment - ${paymentIntent.id}`
            })

          if (transactionError) {
            console.error('Error creating transaction:', transactionError)
            throw transactionError
          }

          // Update account balance
          const { error: balanceError } = await supabase.rpc('update_account_balance', {
            p_user_id: userId,
            p_amount: amount
          })

          if (balanceError) {
            console.error('Error updating balance:', balanceError)
            throw balanceError
          }

          console.log(`✅ Payment processed: $${amount} for user ${userId}`)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('❌ Payment failed:', failedPayment.id)
        
        // Log failed payment
        const userId2 = failedPayment.metadata?.user_id
        if (userId2) {
          await supabase
            .from('transactions')
            .insert({
              user_id: userId2,
              type: 'deposit',
              method: 'stripe',
              amount: failedPayment.amount / 100,
              status: 'failed',
              external_id: failedPayment.id,
              description: `Failed card payment - ${failedPayment.id}`
            })
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    
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