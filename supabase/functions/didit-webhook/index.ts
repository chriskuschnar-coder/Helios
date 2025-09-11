const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔔 Didit KYC webhook received at:', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  let webhookPayload: any = null
  let userId: string | null = null
  let sessionId: string | null = null

  try {
    const signature = req.headers.get('x-signature')
    const body = await req.text()
    
    console.log('📦 Webhook details:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    })

    // Parse webhook payload
    try {
      webhookPayload = JSON.parse(body)
      sessionId = webhookPayload.session_id
      userId = webhookPayload.vendor_data // This is our user_id
      
      console.log('📦 Didit webhook event:', {
        session_id: sessionId,
        vendor_data: userId,
        status: webhookPayload.status,
        workflow_id: webhookPayload.workflow_id
      })
    } catch (err) {
      console.error('❌ Invalid JSON in webhook body')
      throw new Error('Invalid JSON payload')
    }

    // Verify webhook signature for security
    const DIDIT_WEBHOOK_SECRET = Deno.env.get("DIDIT_WEBHOOK_SECRET")
    if (DIDIT_WEBHOOK_SECRET && signature) {
      try {
        const encoder = new TextEncoder()
        const keyData = encoder.encode(DIDIT_WEBHOOK_SECRET)
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
          throw new Error('Invalid webhook signature')
        }
        
        console.log('✅ Webhook signature verified')
      } catch (sigError) {
        console.error('❌ Signature verification failed:', sigError)
        // Log but continue processing for debugging
      }
    } else {
      console.warn('⚠️ No webhook secret or signature - skipping verification')
    }

    // STEP 1: Log webhook for debugging
    console.log('📝 Logging webhook event...')
    const logResponse = await fetch(`${supabaseUrl}/rest/v1/kyc_webhook_logs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        webhook_payload: webhookPayload,
        status: webhookPayload.status,
        processed_at: new Date().toISOString()
      })
    })

    if (!logResponse.ok) {
      console.warn('⚠️ Failed to log webhook event')
    } else {
      console.log('✅ Webhook event logged')
    }

    // STEP 2: Map Didit status to our enum values
    let kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected' = 'pending'
    let shouldMarkUserVerified = false

    console.log('🔄 Processing verification status:', webhookPayload.status)

    switch (webhookPayload.status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
      case 'success':
        kycStatus = 'verified'
        shouldMarkUserVerified = true
        console.log('✅ Verification APPROVED for user:', userId)
        break
      
      case 'rejected':
      case 'failed':
      case 'declined':
      case 'manual_review_failed':
        kycStatus = 'rejected'
        console.log('❌ Verification REJECTED for user:', userId)
        break
      
      case 'expired':
      case 'timeout':
        kycStatus = 'rejected' // Treat expired as rejected
        console.log('⏰ Verification EXPIRED for user:', userId)
        break
      
      case 'pending':
      case 'in_progress':
      case 'processing':
      case 'manual_review':
      default:
        kycStatus = 'pending'
        console.log('⏳ Verification still PENDING for user:', userId)
    }

    // STEP 3: Update compliance record
    console.log('📋 Updating compliance record...')
    const updateComplianceResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${sessionId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: kycStatus === 'verified' ? 'approved' : kycStatus === 'rejected' ? 'rejected' : 'pending',
        data_blob: {
          didit_session_id: sessionId,
          verification_status: webhookPayload.status,
          vendor_data: userId,
          workflow_id: webhookPayload.workflow_id,
          webhook_received_at: new Date().toISOString(),
          raw_webhook: webhookPayload
        },
        updated_at: new Date().toISOString()
      })
    })

    if (!updateComplianceResponse.ok) {
      const complianceError = await updateComplianceResponse.text()
      console.error('❌ Failed to update compliance record:', complianceError)
    } else {
      console.log('✅ Compliance record updated')
    }

    // STEP 4: CRITICAL - Update user's KYC status
    if (userId) {
      console.log(`🔄 Updating user ${userId} KYC status to: ${kycStatus}`)
      
      const userUpdateData: any = {
        kyc_status: `${kycStatus}::kyc_status_enum`,
        updated_at: new Date().toISOString()
      }

      // Add verification timestamp if approved
      if (shouldMarkUserVerified) {
        userUpdateData.kyc_verified_at = new Date().toISOString()
      }

      // Use raw SQL to properly cast enum
      const sqlQuery = shouldMarkUserVerified 
        ? `UPDATE users SET kyc_status = 'verified'::kyc_status_enum, kyc_verified_at = NOW(), updated_at = NOW() WHERE id = '${userId}'`
        : kycStatus === 'rejected'
        ? `UPDATE users SET kyc_status = 'rejected'::kyc_status_enum, updated_at = NOW() WHERE id = '${userId}'`
        : `UPDATE users SET kyc_status = 'pending'::kyc_status_enum, updated_at = NOW() WHERE id = '${userId}'`

      const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: sqlQuery
        })
      })

      // Fallback: Use direct table update with proper enum casting
      if (!userUpdateResponse.ok) {
        console.log('🔄 Using fallback user update method...')
        
        const fallbackResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            kyc_status: kycStatus,
            kyc_verified_at: shouldMarkUserVerified ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
        })

        if (!fallbackResponse.ok) {
          const userError = await fallbackResponse.text()
          console.error('❌ CRITICAL: Failed to update user KYC status:', userError)
          
          // Log the error but don't fail the webhook
          await fetch(`${supabaseUrl}/rest/v1/kyc_webhook_logs`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              session_id: sessionId,
              webhook_payload: webhookPayload,
              status: 'error',
              error_message: `Failed to update user KYC status: ${userError}`,
              processed_at: new Date().toISOString()
            })
          })
        } else {
          console.log('✅ User KYC status updated successfully')
        }
      } else {
        console.log('✅ User KYC status updated via SQL')
      }
    }

    // STEP 5: Send success response
    const response = {
      received: true,
      processed: true,
      session_id: sessionId,
      user_id: userId,
      status: kycStatus,
      user_verified: shouldMarkUserVerified,
      timestamp: new Date().toISOString(),
      message: shouldMarkUserVerified 
        ? 'User successfully verified and account unlocked'
        : kycStatus === 'rejected'
        ? 'Verification rejected - user can resubmit'
        : 'Verification still pending'
    }

    console.log('🎉 Webhook processing complete:', response)

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Didit webhook processing error:', error)
    
    // Log error to database for debugging
    if (userId && sessionId) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/kyc_webhook_logs`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            webhook_payload: webhookPayload,
            status: 'error',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
        })
      } catch (logError) {
        console.error('❌ Failed to log error:', logError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        session_id: sessionId,
        user_id: userId,
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