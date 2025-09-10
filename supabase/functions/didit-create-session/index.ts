import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔐 Didit session creation function called')
  
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

    console.log('🔑 Didit API key found:', DIDIT_API_KEY ? 'Yes' : 'No')
    console.log('🔑 API key length:', DIDIT_API_KEY?.length || 0)
    console.log('🔑 API key prefix:', DIDIT_API_KEY?.substring(0, 8) + '...')

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

    // Create Didit session payload
    const diditPayload = {
      applicant: {
        external_id: userId,
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Name'
      },
      callback_url: `${supabaseUrl}/functions/v1/didit-webhook`,
      return_url: return_url || `${req.headers.get('origin')}/kyc/callback`
    }

    console.log('📡 Calling Didit API with payload:', JSON.stringify(diditPayload, null, 2))

    // Call Didit API with correct authentication
    const diditResponse = await fetch("https://api.didit.me/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": DIDIT_API_KEY, // ✅ Correct header format
      },
      body: JSON.stringify(diditPayload)
    })

    console.log('📊 Didit API response status:', diditResponse.status)
    console.log('📊 Didit API response headers:', Object.fromEntries(diditResponse.headers.entries()))

    if (!diditResponse.ok) {
      let errorData
      const contentType = diditResponse.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await diditResponse.json()
        console.error('❌ Didit API JSON error response:', JSON.stringify(errorData, null, 2))
      } else {
        const errorText = await diditResponse.text()
        console.error('❌ Didit API text error response:', errorText)
        errorData = { message: errorText }
      }
      
      // Log the exact request that failed
      console.error('❌ Failed request details:', {
        url: 'https://api.didit.me/v1/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': DIDIT_API_KEY ? `${DIDIT_API_KEY.substring(0, 8)}...` : 'MISSING'
        },
        payload: diditPayload,
        status: diditResponse.status,
        statusText: diditResponse.statusText
      })
      
      const errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create verification session'
      
      return new Response(
        JSON.stringify({ 
          error: `Didit API Error: ${errorMessage}`,
          status: diditResponse.status,
          type: 'didit_session_creation_failed',
          details: errorData
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      )
    }

    const sessionData = await diditResponse.json()
    console.log('✅ Didit session created successfully:', {
      session_id: sessionData.session_id,
      client_url: sessionData.client_url
    })

    // Store session in compliance_records
    const complianceRecord = {
      user_id: userId,
      provider: 'didit',
      verification_type: 'identity',
      status: 'pending',
      verification_id: sessionData.session_id,
      data_blob: {
        didit_session_id: sessionData.session_id,
        client_url: sessionData.client_url,
        created_at: new Date().toISOString(),
        user_email: user.email
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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
      session_id: sessionData.session_id,
      client_url: sessionData.client_url,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
        type: 'didit_session_creation_failed'
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