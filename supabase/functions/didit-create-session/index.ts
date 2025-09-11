const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🚀 Didit session creation function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, email, first_name, last_name, return_url } = await req.json()

    console.log('📝 Session creation request:', {
      user_id,
      email: email ? email.substring(0, 3) + '***' : 'none',
      first_name,
      last_name,
      return_url
    })

    // Validate required fields
    if (!user_id || !email) {
      throw new Error('Missing required fields: user_id and email are required')
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email format')
    }

    // Get user from JWT token for additional security
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Verify user token
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Invalid user token - please sign in again')
    }
    
    const user = await userResponse.json()
    console.log('✅ User authenticated:', user.email)

    // Verify user_id matches token
    if (user.id !== user_id) {
      throw new Error('User ID mismatch - security violation')
    }

    // Get Didit API credentials
    const diditApiKey = Deno.env.get('DIDIT_API_KEY')
    const diditWorkflowId = Deno.env.get('DIDIT_WORKFLOW_ID') || 'f8d62959-9009-422b-a49a-364909986ab7'
    
    console.log('🔑 Didit configuration:', {
      hasApiKey: !!diditApiKey,
      workflowId: diditWorkflowId,
      apiKeyLength: diditApiKey?.length
    })
    
    if (!diditApiKey) {
      console.error('❌ DIDIT_API_KEY not found in environment variables')
      console.log('🔧 Available environment variables:', Object.keys(Deno.env.toObject()))
      throw new Error('Didit API key not configured - DIDIT_API_KEY missing')
    }

    // STEP 1: Update user status to pending
    console.log('📋 Setting user KYC status to pending...')
    const setPendingResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        kyc_status: 'pending',
        updated_at: new Date().toISOString()
      })
    })

    if (!setPendingResponse.ok) {
      console.warn('⚠️ Failed to set pending status, continuing...')
    } else {
      console.log('✅ User KYC status set to pending')
    }

    // STEP 2: Create Didit verification session
    console.log('🔗 Creating Didit verification session...')
    
    const sessionPayload = {
      workflow_id: diditWorkflowId,
      vendor_data: user_id, // This will be returned in webhook
      callback: return_url || `${new URL(req.url).origin}/kyc/callback`,
      contact_details: {
        email: email,
        email_lang: 'en'
      },
      metadata: {
        user_id: user_id,
        first_name: first_name || email.split('@')[0],
        last_name: last_name || 'User',
        platform: 'Global Markets Consulting',
        created_at: new Date().toISOString()
      }
    }

    console.log('📡 Sending session creation request to Didit...')
    console.log('📦 Session payload:', {
      workflow_id: sessionPayload.workflow_id,
      vendor_data: sessionPayload.vendor_data,
      email: sessionPayload.contact_details.email,
      callback: sessionPayload.callback
    })

    const diditResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': diditApiKey
      },
      body: JSON.stringify(sessionPayload)
    })

    console.log('📊 Didit API response status:', diditResponse.status)

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text()
      console.error('❌ Didit API error:', diditResponse.status, errorText)
      
      let errorMessage = 'Failed to create verification session'
      try {
        const errorData = JSON.parse(errorText)
        console.error('❌ Didit error details:', errorData)
        
        if (diditResponse.status === 401) {
          errorMessage = 'Invalid Didit API key - check credentials'
        } else if (diditResponse.status === 400) {
          errorMessage = `Invalid request: ${errorData.message || 'Check workflow ID and parameters'}`
        } else if (diditResponse.status === 403) {
          errorMessage = 'Didit API access forbidden - check account status'
        } else {
          errorMessage = errorData.message || errorMessage
        }
      } catch (parseError) {
        errorMessage = `Didit API error (${diditResponse.status}): ${errorText.substring(0, 100)}`
      }
      
      throw new Error(errorMessage)
    }

    const sessionData = await diditResponse.json()
    console.log('✅ Didit session created successfully:', {
      session_id: sessionData.session_id,
      session_number: sessionData.session_number,
      url: sessionData.url ? 'URL received' : 'No URL',
      status: sessionData.status
    })

    // Validate session data
    if (!sessionData.session_id || !sessionData.url) {
      throw new Error('Invalid session data received from Didit - missing session_id or URL')
    }

    // STEP 3: Store compliance record with session details
    console.log('📋 Creating compliance record...')
    const complianceResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user_id,
        provider: 'didit',
        verification_type: 'identity',
        status: 'pending',
        verification_id: sessionData.session_id,
        data_blob: {
          session_number: sessionData.session_number,
          workflow_id: diditWorkflowId,
          didit_url: sessionData.url,
          created_at: new Date().toISOString(),
          user_email: email,
          user_name: `${first_name || ''} ${last_name || ''}`.trim()
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
    })

    if (!complianceResponse.ok) {
      const complianceError = await complianceResponse.text()
      console.error('❌ Failed to create compliance record:', complianceError)
      // Don't fail the session creation if compliance record fails
    } else {
      const complianceRecord = await complianceResponse.json()
      console.log('✅ Compliance record created:', complianceRecord[0]?.id)
    }

    // STEP 4: Return session data for frontend
    const response = {
      session_id: sessionData.session_id,
      session_number: sessionData.session_number,
      client_url: sessionData.url, // URL for iframe embedding
      status: sessionData.status,
      workflow_id: sessionData.workflow_id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: 'Verification session created successfully'
    }

    console.log('📤 Returning session response:', {
      ...response,
      client_url: response.client_url ? 'URL provided' : 'No URL'
    })

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Session creation error:', error)
    
    // Log error for debugging
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
            webhook_payload: { error: error.message },
            status: 'session_creation_error',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
        })
      } catch (logError) {
        console.error('❌ Failed to log session creation error:', logError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: 'session_creation_failed',
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