const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔐 Didit v2 session creation function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get Didit API key from environment
    const DIDIT_API_KEY = Deno.env.get("DIDIT_API_KEY")
    const DIDIT_WORKFLOW_ID = Deno.env.get("DIDIT_WORKFLOW_ID")
    
    if (!DIDIT_API_KEY) {
      console.error('❌ Missing DIDIT_API_KEY in environment variables')
      throw new Error("Missing DIDIT_API_KEY in secrets")
    }

    if (!DIDIT_WORKFLOW_ID) {
      console.error('❌ Missing DIDIT_WORKFLOW_ID in environment variables')
      throw new Error("Missing DIDIT_WORKFLOW_ID in secrets - create workflow in Didit Business Console")
    }

    console.log('🔑 Didit credentials found:', {
      hasApiKey: !!DIDIT_API_KEY,
      hasWorkflowId: !!DIDIT_WORKFLOW_ID,
      workflowId: DIDIT_WORKFLOW_ID
    })

    // Get user from JWT token
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

    // Parse request data
    const { user_id, email, first_name, last_name, return_url } = await req.json()

    // Validate required fields
    if (!user_id || !email || !first_name || !last_name) {
      throw new Error('Missing required fields: user_id, email, first_name, last_name')
    }

    console.log('📝 Creating Didit v2 session for user:', {
      user_id,
      email,
      first_name,
      last_name,
      workflow_id: DIDIT_WORKFLOW_ID
    })

    // STEP 1: Create Didit v2 verification session using proper API format
    const sessionPayload = {
      workflow_id: DIDIT_WORKFLOW_ID,
      callback: `${supabaseUrl}/functions/v1/didit-webhook`,
      vendor_data: user_id,
      metadata: {
        user_type: "investor",
        account_id: user_id,
        email: email
      },
      contact_details: {
        email: email,
        email_lang: "en"
      }
    }
    
    console.log('📡 Didit v2 session request:', {
      url: 'https://verification.didit.me/v2/session/',
      method: 'POST',
      payload: JSON.stringify(sessionPayload, null, 2),
      hasApiKey: !!DIDIT_API_KEY
    })

    const sessionResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': DIDIT_API_KEY, // Correct header format for v2
      },
      body: JSON.stringify(sessionPayload)
    })

    console.log('📊 Didit v2 session creation response:', {
      status: sessionResponse.status,
      statusText: sessionResponse.statusText,
      ok: sessionResponse.ok
    })

    if (!sessionResponse.ok) {
      let errorDetails
      const contentType = sessionResponse.headers.get('content-type')
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await sessionResponse.json()
          console.error('❌ Didit v2 API JSON error response:', JSON.stringify(errorDetails, null, 2))
        } else {
          const errorText = await sessionResponse.text()
          console.error('❌ Didit v2 API text error response:', errorText)
          errorDetails = { message: errorText, raw_response: errorText }
        }
      } catch (parseError) {
        console.error('❌ Failed to parse Didit error response:', parseError)
        errorDetails = { message: 'Failed to parse error response', parse_error: parseError.message }
      }
      
      // Provide specific error guidance
      let userFriendlyError = 'Failed to create verification session'
      if (sessionResponse.status === 401) {
        userFriendlyError = 'Invalid API credentials. Please check your Didit API key.'
      } else if (sessionResponse.status === 400) {
        userFriendlyError = 'Invalid workflow configuration. Please check your workflow ID in Didit Business Console.'
      } else if (sessionResponse.status === 404) {
        userFriendlyError = 'Workflow not found. Please create a workflow in Didit Business Console.'
      }
      
      throw new Error(userFriendlyError)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Didit v2 session created successfully:', JSON.stringify(sessionData, null, 2))

    // Extract session details from v2 response
    const sessionId = sessionData.session_id
    const clientUrl = sessionData.url // v2 uses 'url' field

    if (!sessionId) {
      console.error('❌ No session ID in v2 response:', sessionData)
      throw new Error('No session ID returned from Didit v2 API')
    }

    if (!clientUrl) {
      console.error('❌ No client URL in v2 response:', sessionData)
      throw new Error('No verification URL returned from Didit v2 API')
    }

    // Store session in compliance_records
    const complianceRecord = {
      user_id: user_id,
      provider: 'didit',
      verification_type: 'identity',
      status: 'pending',
      verification_id: sessionId,
      data_blob: {
        didit_session_id: sessionId,
        client_url: clientUrl,
        workflow_id: DIDIT_WORKFLOW_ID,
        created_at: new Date().toISOString(),
        user_email: email,
        vendor_data: user_id,
        session_token: sessionData.session_token
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(complianceRecord)
    })

    if (!dbResponse.ok) {
      console.warn('⚠️ Failed to store compliance record')
    } else {
      console.log('✅ Compliance record stored')
    }

    return new Response(JSON.stringify({
      session_id: sessionId,
      client_url: clientUrl,
      session_token: sessionData.session_token,
      workflow_id: DIDIT_WORKFLOW_ID,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: 'Didit v2 verification session created successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Didit v2 session creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create verification session',
        type: 'didit_session_creation_failed',
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