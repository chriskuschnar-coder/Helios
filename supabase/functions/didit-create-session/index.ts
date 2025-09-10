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
    if (!DIDIT_API_KEY) {
      console.error('❌ Missing DIDIT_API_KEY in environment variables')
      throw new Error("Missing DIDIT_API_KEY in secrets")
    }

    console.log('🔑 Didit API key found:', {
      hasApiKey: !!DIDIT_API_KEY,
      keyLength: DIDIT_API_KEY?.length || 0
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
    const { user_id, return_url } = await req.json()
    const userId = user_id || user.id

    // Extract user name from metadata or email
    const fullName = user.user_metadata?.full_name || user.email.split('@')[0]
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || 'Name'

    console.log('📝 Creating Didit v2 session for user:', {
      userId,
      email: user.email,
      firstName,
      lastName
    })

    // STEP 1: Create Didit v2 verification session
    const sessionPayload = {
      workflow: "kYC", // Your Didit workflow name - update this to match your actual workflow
      callback_url: `${supabaseUrl}/functions/v1/didit-webhook`,
      applicant: {
        external_id: userId,
        email: user.email,
        first_name: firstName,
        last_name: lastName
      },
      return_url: return_url || `${req.headers.get('origin') || 'https://localhost:5173'}/kyc/callback`
    }
    
    console.log('📡 Didit v2 session request:', {
      url: 'https://verification.didit.me/v2/session/',
      method: 'POST',
      payload: JSON.stringify(sessionPayload, null, 2),
      hasApiKey: !!DIDIT_API_KEY,
      apiKeyLength: DIDIT_API_KEY?.length || 0
    })

    const sessionResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DIDIT_API_KEY,
      },
      body: JSON.stringify(sessionPayload)
    })

    console.log('📊 Didit v2 session creation response:', {
      status: sessionResponse.status,
      statusText: sessionResponse.statusText,
      ok: sessionResponse.ok,
      headers: Object.fromEntries(sessionResponse.headers.entries())
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
      
      console.error('❌ COMPLETE ERROR CONTEXT:', {
        status: sessionResponse.status,
        statusText: sessionResponse.statusText,
        errorDetails: errorDetails,
        sessionPayload: sessionPayload,
        hasApiKey: !!DIDIT_API_KEY,
        timestamp: new Date().toISOString()
      })
      
      throw new Error(`Didit v2 API Error: ${errorDetails.message || errorDetails.error || 'Failed to create verification session'}`)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Didit v2 session created successfully:', JSON.stringify(sessionData, null, 2))

    // Extract session details from v2 response
    const sessionId = sessionData.session_id || sessionData.id
    const clientUrl = sessionData.client_url || sessionData.url || sessionData.verification_url

    if (!sessionId) {
      console.error('❌ No session ID in v2 response:', sessionData)
      throw new Error('No session ID returned from Didit v2 API')
    }

    if (!clientUrl) {
      console.error('❌ No client URL in v2 response:', sessionData)
      throw new Error('No client URL returned from Didit v2 API')
    }

    // Store session in compliance_records
    const complianceRecord = {
      user_id: userId,
      provider: 'didit',
      verification_type: 'identity',
      status: 'pending',
      verification_id: sessionId,
      data_blob: {
        didit_session_id: sessionId,
        client_url: clientUrl,
        workflow: 'kYC',
        created_at: new Date().toISOString(),
        user_email: user.email,
        applicant_data: sessionPayload.applicant
      },
      expires_at: sessionData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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
      expires_at: sessionData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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