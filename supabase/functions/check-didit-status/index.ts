const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔍 Check Didit status function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { session_id, user_id } = await req.json()
    
    console.log('🔍 Checking Didit status for session:', session_id, 'user:', user_id)
    
    if (!session_id || !user_id) {
      throw new Error('Missing session_id or user_id')
    }

    // Get user from JWT token for security
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Verify user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Invalid user token')
    }
    
    const user = await userResponse.json()
    console.log('✅ User authenticated:', user.email)

    // Verify user_id matches
    if (user.id !== user_id) {
      throw new Error('User ID mismatch')
    }

    // STEP 1: Check our database first
    console.log('🔍 Checking database for current KYC status...')
    const dbStatusResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}&select=kyc_status,kyc_verified_at`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    let currentDbStatus = 'pending'
    if (dbStatusResponse.ok) {
      const userData = await dbStatusResponse.json()
      if (userData.length > 0) {
        currentDbStatus = userData[0].kyc_status
        console.log('📊 Current database status:', currentDbStatus)
        
        // If already verified, return immediately
        if (currentDbStatus === 'verified') {
          return new Response(JSON.stringify({
            session_id: session_id,
            status: 'verified',
            source: 'database',
            is_approved: true,
            message: 'User is already verified',
            timestamp: new Date().toISOString()
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          })
        }
      }
    }

    // STEP 2: Check Didit API for real-time status
    const diditApiKey = Deno.env.get('DIDIT_API_KEY')
    if (!diditApiKey) {
      console.error('❌ DIDIT_API_KEY not found')
      throw new Error('Didit API key not configured')
    }

    console.log('📡 Checking Didit API for session status...')
    
    const diditResponse = await fetch(`https://verification.didit.me/v2/session/${session_id}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': diditApiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Didit API response status:', diditResponse.status)

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text()
      console.error('❌ Didit API error:', errorText)
      
      // If session not found, check our compliance records
      if (diditResponse.status === 404) {
        console.log('🔍 Session not found in Didit, checking compliance records...')
        
        const complianceResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}&user_id=eq.${user_id}&select=*`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (complianceResponse.ok) {
          const records = await complianceResponse.json()
          if (records.length > 0) {
            const record = records[0]
            console.log('📊 Found compliance record with status:', record.status)
            
            return new Response(JSON.stringify({
              session_id: session_id,
              status: record.status,
              source: 'compliance_database',
              is_approved: record.status === 'approved',
              message: `Verification status from database: ${record.status}`,
              timestamp: new Date().toISOString()
            }), {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            })
          }
        }
      }
      
      throw new Error(`Didit API error (${diditResponse.status}): ${errorText}`)
    }

    const sessionData = await diditResponse.json()
    console.log('📊 Didit session data:', {
      session_id: sessionData.session_id,
      status: sessionData.status,
      workflow_id: sessionData.workflow_id,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at
    })

    // STEP 3: Map Didit status to our internal status
    let internalStatus: 'pending' | 'verified' | 'rejected' = 'pending'
    let shouldUpdateUser = false

    switch (sessionData.status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
      case 'success':
        internalStatus = 'verified'
        shouldUpdateUser = true
        console.log('✅ Didit verification APPROVED')
        break
      
      case 'rejected':
      case 'failed':
      case 'declined':
      case 'manual_review_failed':
        internalStatus = 'rejected'
        console.log('❌ Didit verification REJECTED')
        break
      
      case 'expired':
      case 'timeout':
        internalStatus = 'rejected'
        console.log('⏰ Didit verification EXPIRED')
        break
      
      case 'pending':
      case 'in_progress':
      case 'processing':
      case 'manual_review':
      default:
        internalStatus = 'pending'
        console.log('⏳ Didit verification still PENDING')
    }

    // STEP 4: Update compliance record with latest status
    const updateComplianceResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?verification_id=eq.${session_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: internalStatus === 'verified' ? 'approved' : internalStatus === 'rejected' ? 'rejected' : 'pending',
        data_blob: {
          ...sessionData,
          last_status_check: new Date().toISOString(),
          didit_raw_status: sessionData.status,
          checked_via_api: true
        },
        updated_at: new Date().toISOString()
      })
    })

    if (!updateComplianceResponse.ok) {
      console.error('❌ Failed to update compliance record')
    } else {
      console.log('✅ Compliance record updated with status:', internalStatus)
    }

    // STEP 5: Update user's KYC status if changed
    if (shouldUpdateUser || internalStatus !== currentDbStatus) {
      console.log(`🔄 Updating user KYC status from ${currentDbStatus} to ${internalStatus}`)
      
      const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          kyc_status: internalStatus,
          kyc_verified_at: shouldUpdateUser ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
      })

      if (!userUpdateResponse.ok) {
        const userError = await userUpdateResponse.text()
        console.error('❌ Failed to update user KYC status:', userError)
      } else {
        console.log('✅ User KYC status updated successfully')
      }
    }

    // STEP 6: Log the status check
    await fetch(`${supabaseUrl}/rest/v1/kyc_webhook_logs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: user_id,
        session_id: session_id,
        webhook_payload: {
          type: 'manual_status_check',
          didit_response: sessionData,
          previous_status: currentDbStatus,
          new_status: internalStatus
        },
        status: internalStatus,
        processed_at: new Date().toISOString()
      })
    })

    return new Response(JSON.stringify({
      session_id: session_id,
      status: internalStatus,
      didit_status: sessionData.status,
      source: 'didit_api',
      is_approved: shouldUpdateUser,
      status_changed: internalStatus !== currentDbStatus,
      message: shouldUpdateUser 
        ? 'Identity verification approved! Your account is now unlocked.'
        : internalStatus === 'rejected'
        ? 'Identity verification was rejected. Please contact support or resubmit documents.'
        : internalStatus === 'expired'
        ? 'Verification session expired. Please start a new verification.'
        : 'Verification is still being processed. Please wait and check again.',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Didit status check error:', error)
    
    // Log error for debugging
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
          user_id: user_id,
          session_id: session_id,
          webhook_payload: { error: error.message },
          status: 'api_check_error',
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
      })
    } catch (logError) {
      console.error('❌ Failed to log error:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        session_id: session_id,
        user_id: user_id,
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