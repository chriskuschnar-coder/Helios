import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Global Market Consulting',
    version: '1.0.0',
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get request data
    const { price_id, success_url, cancel_url, mode, amount } = await req.json();

    // Validate required parameters
    if (!price_id || !success_url || !cancel_url || !mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['payment', 'subscription'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Must be payment or subscription' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Authenticated user:', user.email);

    // Check if customer exists
    let { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('❌ Error fetching customer:', getCustomerError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer information' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let customerId: string;

    // Create customer if doesn't exist
    if (!customer || !customer.customer_id) {
      console.log('🆕 Creating new Stripe customer for:', user.email);
      
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          platform: 'hedge_fund_web'
        },
      });

      console.log('✅ Created Stripe customer:', newCustomer.id);

      // Save customer mapping
      const { error: createCustomerError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: newCustomer.id,
        });

      if (createCustomerError) {
        console.error('❌ Failed to save customer mapping:', createCustomerError);
        
        // Cleanup Stripe customer
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('❌ Failed to cleanup Stripe customer:', deleteError);
        }

        return new Response(
          JSON.stringify({ error: 'Failed to create customer mapping' }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;
      console.log('✅ Using existing customer:', customerId);
    }

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: mode as 'payment' | 'subscription',
      success_url,
      cancel_url,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        product_type: 'hedge_fund_investment'
      }
    };

    if (mode === 'payment') {
      // For one-time payments, create line item with custom amount
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Investment Amount',
              description: 'Hedge fund investment contribution',
              metadata: {
                product_id: 'investment_amount'
              }
            },
            unit_amount: amount || 10000, // Amount in cents
          },
          quantity: 1,
        },
      ];
    } else {
      // For subscriptions, use the price_id
      sessionConfig.line_items = [
        {
          price: price_id,
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Created checkout session:', session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});