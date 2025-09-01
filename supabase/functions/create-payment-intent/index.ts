import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { amount, currency = 'usd', user_id } = await req.json()
    
    console.log('Creating payment intent:', { amount, currency, user_id })
    
    // Validate amount
    if (!amount || amount < 100) {
      throw new Error('Minimum amount is $1.00 (100 cents)')
    }

    // Create Stripe payment intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        'metadata[user_id]': user_id || '',
        'metadata[purpose]': 'account_funding',
        'metadata[platform]': 'hedge_fund_portal'
      }).toString()
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      console.error('Stripe API error:', error)
      throw new Error(error.error?.message || 'Failed to create payment intent')
    }

    const paymentIntent = await stripeResponse.json()
    console.log('✅ Payment intent created successfully:', paymentIntent.id)

    return new Response(JSON.stringify({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: { message: error.message }
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