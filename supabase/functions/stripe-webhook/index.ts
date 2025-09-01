import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Global Market Consulting',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`❌ Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    console.log('✅ Webhook event received:', event.type);

    // Process the event
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  try {
    const stripeData = event?.data?.object ?? {};

    if (!stripeData) {
      console.log('⚠️ No data in webhook event');
      return;
    }

    console.log('🔄 Processing event:', event.type);

    // Handle checkout session completed (one-time payments)
    if (event.type === 'checkout.session.completed') {
      const session = stripeData as Stripe.Checkout.Session;
      
      if (session.mode === 'payment' && session.payment_status === 'paid') {
        console.log('💰 Processing completed payment for session:', session.id);
        
        // Get user from customer
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', session.customer as string)
          .single();

        if (customerError || !customerData) {
          console.error('❌ Customer not found:', customerError);
          return;
        }

        // Calculate amount in dollars
        const amountInDollars = (session.amount_total || 0) / 100;

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: customerData.user_id,
            account_id: null, // Will be set by trigger
            type: 'deposit',
            method: 'stripe',
            amount: amountInDollars,
            status: 'completed',
            external_id: session.payment_intent as string,
            reference_id: session.id,
            description: 'Stripe checkout payment',
            metadata: {
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
              processed_via: 'webhook'
            }
          });

        if (transactionError) {
          console.error('❌ Error creating transaction:', transactionError);
          return;
        }

        // Update account balance
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', customerData.user_id)
          .single();

        if (accountError || !accountData) {
          console.error('❌ Account not found:', accountError);
          return;
        }

        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            balance: accountData.balance + amountInDollars,
            available_balance: accountData.available_balance + amountInDollars,
            total_deposits: accountData.total_deposits + amountInDollars
          })
          .eq('id', accountData.id);

        if (updateError) {
          console.error('❌ Error updating account balance:', updateError);
          return;
        }

        // Record the order
        const { error: orderError } = await supabase
          .from('stripe_orders')
          .insert({
            checkout_session_id: session.id,
            payment_intent_id: session.payment_intent as string,
            customer_id: session.customer as string,
            amount_subtotal: session.amount_subtotal || 0,
            amount_total: session.amount_total || 0,
            currency: session.currency || 'usd',
            payment_status: session.payment_status || 'paid',
            status: 'completed'
          });

        if (orderError) {
          console.error('❌ Error recording order:', orderError);
        }

        console.log('✅ Payment processed successfully - Amount:', amountInDollars);
      }
    }

    // Handle subscription events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = stripeData as Stripe.PaymentIntent;
      console.log('💰 Payment intent succeeded:', paymentIntent.id);
      
      // Additional confirmation logging
      console.log('✅ Payment confirmed via payment_intent.succeeded webhook');
    }
    
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = stripeData as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', paymentIntent.id);
      
      // Could add failure handling here if needed
    }

  } catch (error) {
    console.error('❌ Error handling webhook event:', error);
  }
}

async function syncSubscriptionFromStripe(customerId: string) {
  try {
    console.log('🔄 Syncing subscription for customer:', customerId);
    
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.log('📭 No subscriptions found for customer:', customerId);
      
      const { error: noSubError } = await supabase
        .from('stripe_subscriptions')
        .upsert({
          customer_id: customerId,
          status: 'not_started',
        }, {
          onConflict: 'customer_id',
        });

      if (noSubError) {
        console.error('❌ Error updating subscription status:', noSubError);
      }
      return;
    }

    // Get the latest subscription
    const subscription = subscriptions.data[0];

    // Update subscription in database
    const { error: subError } = await supabase
      .from('stripe_subscriptions')
      .upsert({
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      }, {
        onConflict: 'customer_id',
      });

    if (subError) {
      console.error('❌ Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    
    console.log('✅ Successfully synced subscription for customer:', customerId);
  } catch (error) {
    console.error(`❌ Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}