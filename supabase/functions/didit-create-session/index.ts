const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DiditSessionRequest {
  user_id: string
  return_url?: string
}

Deno.serve(async (req) => {
  console.log('🔐 Didit KYC session creation function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
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

    // Check if user already has verified KYC
    const existingKycResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records?user_id=eq.${user.id}&verification_type=eq.identity&status=eq.approved&select=*`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (existingKycResponse.ok) {
      const existingKyc = await existingKycResponse.json()
      if (existingKyc.length > 0) {
        console.log('✅ User already has approved KYC verification')
        return new Response(JSON.stringify({
          already_verified: true,
          message: 'User already has approved identity verification',
          verification_id: existingKyc[0].verification_id
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        })
      }
    }

    // Didit API configuration
    const diditApiKey = Deno.env.get('DIDIT_API_KEY')
    if (!diditApiKey) {
      throw new Error('DIDIT_API_KEY environment variable is not configured')
    }
    const diditApiBase = 'https://api.didit.me'
    
    const returnUrl = req.headers.get('origin') + '/kyc/callback'
    const webhookUrl = `${supabaseUrl}/functions/v1/didit-webhook`
    
    console.log('🔍 Creating Didit session with:', {
      user_id: user.id,
      email: user.email,
      return_url: returnUrl,
      webhook_url: webhookUrl
    })

    // Create Didit verification session
    const diditPayload = {
      applicant: {
        external_id: user.id,
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || 'User',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Name'
      },
      callback_url: webhookUrl,
      return_url: returnUrl,
      config: {
        document_types: ['passport', 'driving_license', 'national_id'],
        require_liveness: true,
        require_address_verification: false,
        aml_check: true,
        pep_check: true
      }
    }

    console.log('📡 Sending request to Didit API...')
    
    const diditResponse = await fetch(`${diditApiBase}/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${diditApiKey}`
      },
      body: JSON.stringify(diditPayload)
    })

    console.log('📊 Didit response status:', diditResponse.status)

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text()
      console.error('❌ Didit API error:', errorText)
      
      let errorMessage = 'Failed to create verification session'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = errorText.substring(0, 200)
      }
      
      throw new Error(errorMessage)
    }

    const diditSession = await diditResponse.json()
    console.log('✅ Didit session created:', {
      session_id: diditSession.session_id,
      client_url: diditSession.client_url
    })

    // Store verification session in compliance_records
    const complianceRecord = {
      user_id: user.id,
      provider: 'didit',
      verification_type: 'identity',
      status: 'pending',
      verification_id: diditSession.session_id,
      data_blob: {
        didit_session_id: diditSession.session_id,
        client_url: diditSession.client_url,
        created_at: new Date().toISOString(),
        user_email: user.email,
        return_url: returnUrl
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/compliance_records`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(complianceRecord)
    })

    if (!dbResponse.ok) {
      const dbError = await dbResponse.text()
      console.error('❌ Failed to store compliance record:', dbError)
      // Don't fail the session creation if DB insert fails
    } else {
      const storedRecord = await dbResponse.json()
      console.log('✅ Compliance record stored:', storedRecord[0]?.id)
    }

    // Return session details for frontend
    return new Response(JSON.stringify({
      session_id: diditSession.session_id,
      client_url: diditSession.client_url,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: 'Verification session created successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Didit session creation error:', error)
    
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