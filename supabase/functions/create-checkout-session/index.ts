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
    const { amount, user_id, user_email } = await req.json()
    
    console.log('Creating checkout session for hedge fund investment:', { amount, user_id, user_email })
    
    // Validate amount (minimum $100)
    if (!amount || amount < 100) {
      throw new Error('Minimum investment amount is $100')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://globalmarketsconsulting.com'

    // Create Stripe checkout session for hedge fund investment
    const checkoutData = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Hedge Fund Investment',
            description: `Capital contribution to Global Market Consulting hedge fund`,
            images: []
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      }],
      success_url: `${origin}/funding-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/funding-cancelled`,
      customer_email: user_email,
      metadata: {
        user_id: user_id || 'demo-user',
        investment_type: 'hedge_fund_capital',
        amount_usd: amount.toString()
      },
      payment_intent_data: {
        metadata: {
          user_id: user_id || 'demo-user',
          investment_type: 'hedge_fund_capital',
          amount_usd: amount.toString()
        }
      }
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(checkoutData as any).toString()
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      console.error('Stripe API error:', error)
      throw new Error(error.error?.message || 'Failed to create checkout session')
    }

    const session = await stripeResponse.json()
    console.log('✅ Checkout session created successfully:', session.id)

    // Create payment record in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const paymentRecord = {
      user_id: user_id || 'demo-user',
      product_id: 'hedge_fund_investment',
      quantity: 1,
      total_amount: amount,
      status: 'pending',
      stripe_session_id: session.id,
      is_paid: false,
      metadata: {
        stripe_session_id: session.id,
        investment_type: 'hedge_fund_capital',
        checkout_url: session.url
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
      console.warn('Payment record creation failed, but checkout session created successfully')
    } else {
      console.log('✅ Payment record created in database')
    }

    return new Response(JSON.stringify({
      id: session.id,
      url: session.url
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    
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