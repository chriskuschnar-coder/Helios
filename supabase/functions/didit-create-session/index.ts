const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔐 Didit session creation function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get Didit credentials from environment
    const DIDIT_CLIENT_ID = Deno.env.get("DIDIT_CLIENT_ID")
    const DIDIT_CLIENT_SECRET = Deno.env.get("DIDIT_CLIENT_SECRET")
    
    if (!DIDIT_CLIENT_ID || !DIDIT_CLIENT_SECRET) {
      console.error('❌ Missing Didit OAuth credentials')
      throw new Error("Missing DIDIT_CLIENT_ID or DIDIT_CLIENT_SECRET in environment variables")
    }

    console.log('🔑 Didit OAuth credentials found:', {
      hasClientId: !!DIDIT_CLIENT_ID,
      hasClientSecret: !!DIDIT_CLIENT_SECRET,
      clientIdLength: DIDIT_CLIENT_ID?.length || 0,
      secretLength: DIDIT_CLIENT_SECRET?.length || 0
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

    console.log('📝 Creating Didit session for user:', userId)

    // STEP 1: Get OAuth access token from Didit
    console.log('🔐 Getting OAuth access token from Didit...')
    
    const credentials = btoa(`${DIDIT_CLIENT_ID}:${DIDIT_CLIENT_SECRET}`)
    console.log('🔍 OAuth request details:', {
      url: 'https://apx.didit.me/auth/v2/token/',
      method: 'POST',
      hasCredentials: !!credentials,
      credentialsLength: credentials.length
    })

    const tokenResponse = await fetch('https://apx.didit.me/auth/v2/token/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    console.log('📊 OAuth token response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ OAuth token request failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenError,
        credentials: credentials.substring(0, 20) + '...'
      })
      throw new Error(`OAuth token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ OAuth token received:', {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    })

    if (!tokenData.access_token) {
      throw new Error('No access token received from Didit OAuth')
    }

    // STEP 2: Create verification session using access token
    console.log('📝 Creating verification session with access token...')
    
    const sessionPayload = {
      user_id: userId,
      email: user.email,
      callback_url: `${supabaseUrl}/functions/v1/didit-webhook`,
      return_url: return_url || `${req.headers.get('origin') || 'https://localhost:5173'}/kyc/callback`
    }
    
    console.log('📡 Session request payload:', JSON.stringify(sessionPayload, null, 2))
    console.log('🔍 Session request details:', {
      url: 'https://verification.didit.me/v2/session/',
      method: 'POST',
      hasAccessToken: !!tokenData.access_token,
      accessTokenLength: tokenData.access_token?.length || 0
    })

    const sessionResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify(sessionPayload)
    })

    console.log('📊 Didit session creation response:', {
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
          console.error('❌ Didit API JSON error response:', JSON.stringify(errorDetails, null, 2))
        } else {
          const errorText = await sessionResponse.text()
          console.error('❌ Didit API text error response:', errorText)
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
        hasAccessToken: !!tokenData.access_token,
        timestamp: new Date().toISOString()
      })
      
      throw new Error(`Didit API Error: ${errorDetails.message || errorDetails.error || 'Failed to create verification session'}`)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Didit session created successfully:', JSON.stringify(sessionData, null, 2))

    // Extract session details
    const sessionId = sessionData.session_id || sessionData.id
    const clientUrl = sessionData.client_url || sessionData.url || sessionData.verification_url

    if (!sessionId) {
      console.error('❌ No session ID in response:', sessionData)
      throw new Error('No session ID returned from Didit')
    }

    if (!clientUrl) {
      console.error('❌ No client URL in response:', sessionData)
      throw new Error('No client URL returned from Didit')
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
        created_at: new Date().toISOString(),
        user_email: user.email,
        oauth_token_expires: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null
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
      message: 'Verification session created successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('❌ Session creation error:', error)
    
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