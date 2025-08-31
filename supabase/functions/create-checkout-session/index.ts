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
    
    console.log('🔄 Creating dynamic checkout session:', { amount, user_id, user_email })
    
    // Validate amount (minimum $100)
    if (!amount || amount < 100) {
      throw new Error('Minimum investment amount is $100')
    }

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY environment variable not set')
      throw new Error('Payment system not configured. Please contact support.')
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://globalmarketsconsulting.com'
    
    console.log('🌐 Using origin for redirects:', origin)

    // Create dynamic Stripe checkout session
    const checkoutParams = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': 'payment',
      'success_url': `${origin}/funding-success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      'cancel_url': `${origin}/funding-cancelled`,
      'customer_email': user_email || '',
      'metadata[user_id]': user_id || 'demo-user',
      'metadata[investment_type]': 'hedge_fund_capital_contribution',
      'metadata[fund_name]': 'Global Market Consulting Fund',
      'metadata[amount_usd]': amount.toString(),
      'metadata[investor_type]': 'qualified_investor',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Investment Capital - Global Market Consulting Fund',
      'line_items[0][price_data][product_data][description]': `Capital contribution of $${amount.toLocaleString()} to Global Market Consulting quantitative hedge fund`,
      'line_items[0][price_data][unit_amount]': (amount * 100).toString(), // Convert to cents
      'line_items[0][quantity]': '1',
      'payment_intent_data[metadata][user_id]': user_id || 'demo-user',
      'payment_intent_data[metadata][investment_type]': 'hedge_fund_capital_contribution',
      'payment_intent_data[metadata][fund_name]': 'Global Market Consulting Fund',
      'payment_intent_data[metadata][amount_usd]': amount.toString(),
      'payment_intent_data[description]': `Hedge fund investment - $${amount.toLocaleString()}`
    })

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutParams.toString()
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      console.error('Stripe API error:', error)
      throw new Error(error.error?.message || 'Failed to create checkout session')
    }

    const session = await stripeResponse.json()
    console.log('✅ Dynamic checkout session created successfully:', session.id)

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
        checkout_url: session.url,
        dynamic_amount: amount
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
      url: session.url,
      amount: amount
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Dynamic checkout session creation error:', error)
    
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