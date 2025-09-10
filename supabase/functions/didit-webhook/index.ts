import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 Didit webhook received')
    
    const body = await req.json()
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2))

    // Verify webhook signature if needed
    const webhookSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET')
    if (webhookSecret) {
      const signature = req.headers.get('x-didit-signature')
      console.log('🔐 Webhook signature:', signature)
      // TODO: Implement signature verification
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract verification data from webhook
    const {
      session_id,
      external_id: user_id,
      status,
      verification_type = 'identity',
      provider = 'didit',
      data: verification_data
    } = body

    console.log('📊 Processing verification:', {
      session_id,
      user_id,
      status,
      verification_type,
      provider
    })

    if (!user_id) {
      console.error('❌ Missing user_id in webhook payload')
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update or insert compliance record
    const { data: complianceRecord, error: complianceError } = await supabase
      .from('compliance_records')
      .upsert({
        user_id,
        provider,
        verification_type,
        status: status === 'completed' ? 'approved' : status === 'failed' ? 'rejected' : 'pending',
        verification_id: session_id,
        data_blob: verification_data || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,verification_type,provider'
      })
      .select()
      .single()

    if (complianceError) {
      console.error('❌ Failed to update compliance record:', complianceError)
      throw complianceError
    }

    console.log('✅ Compliance record updated:', complianceRecord)

    // If verification is approved, update user's KYC status
    if (status === 'completed' || status === 'approved') {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          kyc_status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)

      if (userUpdateError) {
        console.error('❌ Failed to update user KYC status:', userUpdateError)
        throw userUpdateError
      }

      console.log('✅ User KYC status updated to verified')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        compliance_record_id: complianceRecord.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Webhook processing failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})