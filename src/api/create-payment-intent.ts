import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || 'sk_test_51S25DbFhEA0kH7xcFTmmlwmgxFUdKDnPpLu4vxCbT5xBOpT8SpnvbfKaR7a9e7oRGkqt1vdMD05nrvmVFnqIwqJl00UilCHTRD', {
  apiVersion: '2024-06-20',
})

export async function POST(request: Request) {
  try {
    const { amount, user_id } = await request.json()
    
    console.log('Creating payment intent:', { amount, user_id })
    
    // Validate amount (minimum $1.00)
    if (!amount || amount < 100) {
      throw new Error('Minimum amount is $1.00 (100 cents)')
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user_id || 'demo-user',
        purpose: 'hedge_fund_investment',
        investment_type: 'capital_contribution',
        fund_name: 'Global Market Consulting Fund',
      },
      description: `Hedge fund investment - $${(amount / 100).toLocaleString()}`
    })

    console.log('✅ Payment intent created successfully:', paymentIntent.id)

    return new Response(JSON.stringify({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }), {
      headers: {
        'Content-Type': 'application/json',
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
        },
      }
    )
  }
}