const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('📱 Send 2FA code function called')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { method, email, phone } = await req.json()
    
    console.log('📝 2FA code request:', { method, email, phone: phone ? '***-***-' + phone.slice(-4) : 'none' })
    
    // Validate inputs
    if (!method || !['email', 'sms'].includes(method)) {
      throw new Error('Invalid verification method')
    }
    
    if (method === 'email' && !email) {
      throw new Error('Email address required for email verification')
    }
    
    if (method === 'sms' && !phone) {
      throw new Error('Phone number required for SMS verification')
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
    console.log('✅ User authenticated for 2FA:', user.email)

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔑 Generated 2FA code:', code)

    // Store code in database with expiration
    const { error: storeError } = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: user.id,
        code: code,
        method: method,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        used: false
      })
    })

    // Send verification code based on method
    if (method === 'email') {
      console.log('📧 Sending email verification code to:', email)
      
      // In production, integrate with email service like SendGrid, AWS SES, etc.
      // For demo, we'll simulate email sending
      console.log(`
        📧 EMAIL SENT TO: ${email}
        🔑 VERIFICATION CODE: ${code}
        ⏰ EXPIRES: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}
      `)
      
      // Simulate email API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } else if (method === 'sms') {
      console.log('📱 Sending SMS verification code to:', phone)
      
      // In production, integrate with SMS service like Twilio, AWS SNS, etc.
      // For demo, we'll simulate SMS sending
      console.log(`
        📱 SMS SENT TO: ${phone}
        🔑 VERIFICATION CODE: ${code}
        ⏰ EXPIRES: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}
      `)
      
      // Simulate SMS API call
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    return new Response(JSON.stringify({
      success: true,
      method: method,
      destination: method === 'email' ? email : phone,
      expires_in: 600, // 10 minutes
      demo_code: code, // For testing - remove in production
      message: `Verification code sent via ${method}`
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Send 2FA code error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
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