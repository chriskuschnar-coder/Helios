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
    const { amount, currency = 'usd', user_id } = await req.json()
    
    console.log('Creating payment intent:', { amount, currency, user_id })
    
    // Validate amount (minimum $1.00)
    if (!amount || amount < 100) {
      throw new Error('Minimum amount is $1.00 (100 cents)')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_51S25DbFhEA0kH7xcFTmmlwmgxFUdKDnPpLu4vxCbT5xBOpT8SpnvbfKaR7a9e7oRGkqt1vdMD05nrvmVFnqIwqJl00UilCHTRD'
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Create Stripe payment intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        'metadata[user_id]': user_id || 'demo-user',
        'metadata[purpose]': 'hedge_fund_investment',
        'metadata[investment_type]': 'capital_contribution',
        'metadata[fund_name]': 'Global Market Consulting Fund',
        'description': `Hedge fund investment - $${(amount / 100).toLocaleString()}`
      }).toString()
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      console.error('Stripe API error:', error)
      throw new Error(error.error?.message || 'Failed to create payment intent')
    }

    const paymentIntent = await stripeResponse.json()
    console.log('✅ Payment intent created successfully:', paymentIntent.id)

    // Create payment record in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const paymentRecord = {
      user_id: user_id || 'demo-user',
      product_id: 'hedge_fund_investment',
      quantity: 1,
      total_amount: amount / 100, // Convert from cents to dollars
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      metadata: {
        stripe_payment_intent: paymentIntent.id,
        currency: currency,
        investment_type: 'hedge_fund_capital',
        fund_name: 'Global Market Consulting Fund'
      }
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(paymentRecord)
    })

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json()
      console.error('Database error:', dbError)
      // Don't fail the payment intent creation if DB insert fails
      console.warn('Payment record creation failed, but payment intent created successfully')
    } else {
      console.log('✅ Payment record created in database')
    }

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