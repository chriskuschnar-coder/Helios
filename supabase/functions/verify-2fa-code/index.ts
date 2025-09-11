const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('🔍 Verify 2FA code function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { user_id, code, email, method = 'email' } = await req.json()
    
    console.log('🔍 2FA verification request:', { user_id, code: code ? '***' + code.slice(-2) : 'none', email: email ? email.substring(0, 3) + '***' : 'none' })
    
    // Validate inputs
    if (!user_id) {
      throw new Error('User ID required')
    }
    
    if (!email) {
      throw new Error('Email required')
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code format - must be 6 digits')
    }

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
    console.log('✅ User authenticated for verification:', user.email)

    // Get the most recent unused code for this user and method
    const codesResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?user_id=eq.${user.id}&method=eq.${method}&used=eq.false&expires_at=gte.${new Date().toISOString()}&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!codesResponse.ok) {
      console.error('❌ Failed to retrieve verification codes')
      throw new Error('Failed to retrieve verification codes')
    }

    const codes = await codesResponse.json()
    console.log('📊 Found codes:', codes.length)
    
    if (codes.length === 0) {
      throw new Error('No valid verification code found. Code may have expired. Please request a new code.')
    }

    const storedCode = codes[0]
    console.log('🔍 Comparing codes:', { 
      provided: '***' + code.slice(-2), 
      stored: '***' + storedCode.code.slice(-2),
      expires: storedCode.expires_at,
      used: storedCode.used
    })

    // Check if code has expired
    if (new Date(storedCode.expires_at) < new Date()) {
      console.log('⏰ Code has expired')
      throw new Error('Verification code has expired. Please request a new code.')
    }

    // Verify the code matches
    if (code === storedCode.code) {
      console.log('✅ 2FA code verification successful')
      
      // Mark code as used
      const markUsedResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes?id=eq.${storedCode.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          used: true
        })
      })

      if (!markUsedResponse.ok) {
        console.error('❌ Failed to mark code as used')
      }

      // Update user's last login timestamp
      const updateLoginResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          last_login: new Date().toISOString()
        })
      })

      if (!updateLoginResponse.ok) {
        console.error('❌ Failed to update last login')
      }

      return new Response(JSON.stringify({
        valid: true,
        message: '2FA verification successful',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    } else {
      console.log('❌ 2FA code verification failed - codes do not match')
      
      return new Response(JSON.stringify({
        valid: false,
        message: 'Invalid verification code',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }
  } catch (error) {
    console.error('❌ 2FA verification error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        valid: false,
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