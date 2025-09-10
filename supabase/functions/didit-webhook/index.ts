const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-didit-signature, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DiditWebhookEvent {
  session_id: string
  applicant_id: string
  status: string
  details?: any
  event_type?: string
  timestamp?: string
}

Deno.serve(async (req) => {
  console.log('🔔 Didit webhook received')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const signature = req.headers.get('x-didit-signature') || req.headers.get('x-signature')
    const body = await req.text()
    
    console.log('📦 Webhook details:', {
      signature: signature?.substring(0, 20) + '...',
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    })

    // Verify webhook signature for security
    const webhookSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET')
    if (webhookSecret && signature) {
      try {
        const encoder = new TextEncoder()
        const keyData = encoder.encode(webhookSecret)
        const messageData = encoder.encode(body)
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        
        const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
        const computedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        
        if (signature !== computedSignature) {
          console.error('❌ Invalid webhook signature')
          return new Response('Invalid signature', { status: 401 })
        }
        
        console.log('✅ Webhook signature verified')
      } catch (sigError) {
        console.error('❌ Signature verification failed:', sigError)
        // Continue processing but log the error
      }
    } else {
      console.warn('⚠️ No webhook secret or signature provided - skipping verification')
    }

    // Parse the webhook payload
    let event: DiditWebhookEvent
    try {
      event = JSON.parse(body)
      console.log('📦 Didit webhook event:', {
        session_id: event.session_id,
        applicant_id: event.applicant_id,
        status: event.status,
        event_type: event.event_type
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      return new Response('Invalid JSON', { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Handle verification status updates
    const { session_id, applicant_id, status, details, event_type } = event
    
    console.log('🔄 Processing Didit verification result:', {
      session_id,
      applicant_id,
      status,
      event_type
    })

    // Map Didit status to our compliance status
    let complianceStatus = 'pending'
    let shouldMarkUserVerified = false

    switch (status) {
      case 'verified':
      case 'completed:verified':
      case 'approved':
        complianceStatus = 'approved'
        shouldMarkUserVerified = true
        console.log('✅ Verification APPROVED for user:', applicant_id)
        break
      
      case 'rejected':
      case 'failed':
      case 'declined':
        complianceStatus = 'rejected'
        console.log('❌ Verification REJECTED for user:', applicant_id)
        break
      
      case 'expired':
        complianceStatus = 'expired'
        console.log('⏰ Verification EXPIRED for user:', applicant_id)
        break
      
      default:
        console.log('ℹ️ Verification status update:', status, 'for user:', applicant_id)
        // Keep as pending for other statuses
    }

    // Update compliance record
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: complianceStatus,
        data_blob: {
          didit_session_id: session_id,
          verification_status: status,
          verification_details: details || {},
          webhook_received_at: new Date().toISOString(),
          event_type: event_type
        },
        updated_at: new Date().toISOString()
      })
    })

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text()
      console.error('❌ Failed to update compliance record:', updateError)
    } else {
      const updatedRecord = await updateResponse.json()
      console.log('✅ Compliance record updated:', updatedRecord[0]?.id)
    }

    // If verification approved, update user's KYC status
    if (shouldMarkUserVerified && applicant_id) {
      console.log('✅ Marking user as KYC verified:', applicant_id)
      
      const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${applicant_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          kyc_status: 'verified',
          updated_at: new Date().toISOString()
        })
      })

      if (!userUpdateResponse.ok) {
        console.error('❌ Failed to update user KYC status')
      } else {
        console.log('✅ User KYC status updated to verified')
      }
    }

    return new Response(JSON.stringify({ 
      received: true,
      processed: true,
      session_id: session_id,
      status: complianceStatus,
      user_verified: shouldMarkUserVerified,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Didit webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
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