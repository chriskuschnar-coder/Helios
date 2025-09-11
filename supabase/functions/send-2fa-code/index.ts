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
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/two_factor_codes`, {
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

    if (!storeResponse.ok) {
      console.error('❌ Failed to store 2FA code')
      throw new Error('Failed to store verification code')
    }

    // Send verification code based on method
    if (method === 'email') {
      console.log('📧 Sending email verification code to:', email)
      
      try {
        // Use built-in fetch for email sending (simple SMTP or email service)
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; margin-bottom: 10px;">Global Markets Consulting</h1>
              <h2 style="color: #374151; margin-bottom: 20px;">Two-Factor Authentication</h2>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 4px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #6b7280; margin-bottom: 15px;">
              Enter this code in your browser to complete the login process.
            </p>
            
            <p style="color: #6b7280; margin-bottom: 15px;">
              This code will expire in 10 minutes for security purposes.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                If you didn't request this code, please ignore this email.
                <br>
                Global Markets Consulting - Secure Investment Platform
              </p>
            </div>
          </div>
        `

        // For now, log the email content (in production, integrate with SendGrid/AWS SES)
        console.log(`
          📧 EMAIL WOULD BE SENT TO: ${email}
          🔑 VERIFICATION CODE: ${code}
          📝 EMAIL CONTENT: HTML email with styled verification code
          ⏰ EXPIRES: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}
        `)
        
        // TODO: Replace with actual email service integration
        // Example with SendGrid:
        /*
        const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
        const fromEmail = Deno.env.get('FROM_EMAIL')
        
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: email }],
              subject: 'Your Global Markets 2FA Code'
            }],
            from: { email: fromEmail },
            content: [{
              type: 'text/html',
              value: emailBody
            }]
          })
        })
        */
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
        throw new Error('Failed to send email verification code')
      }
      
    } else if (method === 'sms') {
      console.log('📱 Sending SMS verification code to:', phone)
      
      try {
        // Get Twilio credentials from environment
        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
        
        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
          console.error('❌ Missing Twilio credentials')
          throw new Error('SMS service not configured')
        }

        console.log('📱 Using Twilio credentials:', {
          accountSid: twilioAccountSid.substring(0, 10) + '...',
          fromNumber: twilioPhoneNumber,
          toNumber: phone
        })

        // Create Twilio message using their REST API
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        
        const messageBody = `Your Global Markets verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore.`
        
        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhoneNumber,
            Body: messageBody
          })
        })

        if (!twilioResponse.ok) {
          const twilioError = await twilioResponse.json()
          console.error('❌ Twilio API error:', twilioError)
          
          if (twilioError.code === 21211) {
            throw new Error('Phone number not verified for trial account. Please verify this number in Twilio console first.')
          } else if (twilioError.code === 21614) {
            throw new Error('Invalid phone number format. Please use format: +1234567890')
          } else {
            throw new Error(`SMS delivery failed: ${twilioError.message || 'Unknown error'}`)
          }
        }

        const twilioResult = await twilioResponse.json()
        console.log('✅ SMS sent successfully via Twilio:', twilioResult.sid)
        
      } catch (smsError) {
        console.error('❌ SMS sending failed:', smsError)
        throw new Error(smsError.message || 'Failed to send SMS verification code')
      }
    }

    return new Response(JSON.stringify({
      success: true,
      method: method,
      destination: method === 'email' ? email : phone,
      expires_in: 600, // 10 minutes
      message: `Verification code sent via ${method}`,
      // Remove demo_code in production
      demo_code: code // For testing - shows in console
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