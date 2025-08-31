import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'

const app = express()
const port = 3001

// Initialize Stripe with your secret key
const stripe = new Stripe('sk_test_51S25DbFhEA0kH7xcFTmmlwmgxFUdKDnPpLu4vxCbT5xBOpT8SpnvbfKaR7a9e7oRGkqt1vdMD05nrvmVFnqIwqJl00UilCHTRD', {
  apiVersion: '2024-06-20',
})

// Middleware
app.use(cors())
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Stripe API Server Running',
    status: 'OK',
    endpoints: [
      'POST /api/create-payment-intent',
      'GET /api/health'
    ]
  })
})

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, user_id } = req.body
    
    console.log('Creating payment intent:', { amount, user_id })
    
    // Validate amount (minimum $1.00)
    if (!amount || amount < 100) {
      return res.status(400).json({ 
        error: { message: 'Minimum amount is $1.00 (100 cents)' }
      })
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

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    res.status(400).json({ 
      error: { message: error.message }
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', stripe: 'Connected' })
})

app.listen(port, () => {
  console.log(`🚀 Stripe API server running on http://localhost:${port}`)
  console.log('✅ Stripe integration ready for testing')
})