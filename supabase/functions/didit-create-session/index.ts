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
      console.error('❌ Missing Didit credentials in environment variables')
      console.error('Required: DIDIT_CLIENT_ID and DIDIT_CLIENT_SECRET')
      throw new Error("Missing Didit credentials in environment variables")
    }

    console.log('🔑 Didit credentials found:', {
      hasClientId: !!DIDIT_CLIENT_ID,
      hasClientSecret: !!DIDIT_CLIENT_SECRET,
      clientIdLength: DIDIT_CLIENT_ID?.length || 0,
      clientSecretLength: DIDIT_CLIENT_SECRET?.length || 0
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

    // Get request data
    const { user_id, return_url } = await req.json()
    const userId = user_id || user.id

    console.log('📝 Creating session for user:', userId)

    // STEP 1: Get OAuth access token from Didit
    console.log('🔑 Step 1: Getting OAuth access token from Didit...')
    
    const credentials = btoa(`${DIDIT_CLIENT_ID}:${DIDIT_CLIENT_SECRET}`)
    console.log('🔍 Base64 credentials length:', credentials.length)
    
    const tokenResponse = await fetch('https://apx.didit.me/auth/v2/token/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    console.log('📊 Token response status:', tokenResponse.status)
    console.log('📊 Token response headers:', Object.fromEntries(tokenResponse.headers.entries()))

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ Failed to get OAuth token:', tokenError)
      console.error('❌ Token request details:', {
        url: 'https://apx.didit.me/auth/v2/token/',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials.substring(0, 20)}...`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials',
        status: tokenResponse.status,
        statusText: tokenResponse.statusText
      })
      
      throw new Error(`Failed to get OAuth token: ${tokenError}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ OAuth token received:', {
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      access_token_length: tokenData.access_token?.length || 0
    })

    const accessToken = tokenData.access_token
    if (!accessToken) {
      throw new Error('No access token received from Didit')
    }

    // STEP 2: Create verification session using the access token
    console.log('🔐 Step 2: Creating verification session with access token...')
    
    const sessionPayload = {
      user_id: userId
    }

    console.log('📡 Session creation payload:', JSON.stringify(sessionPayload, null, 2))

    const sessionResponse = await fetch('https://verification.didit.me/v2/session/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload)
    })

    console.log('📊 Session creation response status:', sessionResponse.status)
    console.log('📊 Session creation response headers:', Object.fromEntries(sessionResponse.headers.entries()))

    if (!sessionResponse.ok) {
      let sessionError
      const contentType = sessionResponse.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        sessionError = await sessionResponse.json()
        console.error('❌ Didit session creation JSON error:', JSON.stringify(sessionError, null, 2))
      } else {
        const errorText = await sessionResponse.text()
        console.error('❌ Didit session creation text error:', errorText)
        sessionError = { message: errorText }
      }
      
      console.error('❌ Session creation request details:', {
        url: 'https://verification.didit.me/v2/session/',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
          'Content-Type': 'application/json'
        },
        payload: sessionPayload,
        status: sessionResponse.status,
        statusText: sessionResponse.statusText
      })
      
      const errorMessage = sessionError.message || sessionError.error || sessionError.detail || 'Failed to create verification session'
      throw new Error(`Didit session creation failed: ${errorMessage}`)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Didit session created successfully:', {
      session_id: sessionData.session_id || sessionData.id,
      client_url: sessionData.client_url || sessionData.url,
      expires_at: sessionData.expires_at
    })

    // Extract session details (Didit API may use different field names)
    const sessionId = sessionData.session_id || sessionData.id
    const clientUrl = sessionData.client_url || sessionData.url || sessionData.verification_url

    if (!sessionId || !clientUrl) {
      console.error('❌ Missing session data:', sessionData)
      throw new Error('Incomplete session data from Didit')
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