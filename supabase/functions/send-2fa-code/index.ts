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

    // PRIORITY: Send email first (primary method)
    if (method === 'email') {
      console.log('📧 Sending email verification code via SendGrid to:', email)
      
      try {
        // Get SendGrid credentials
        const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
        const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@globalmarketsconsulting.com'
        
        if (!sendgridApiKey) {
          console.error('❌ SENDGRID_API_KEY not found in environment variables')
          throw new Error('Email service not configured')
        }

        console.log('📧 Using SendGrid with from email:', fromEmail)

        // Create professional HTML email template
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Global Markets Consulting</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Secure Account Access</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">
                  Your Verification Code
                </h2>
                
                <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                  Enter this code in your browser to complete the login process:
                </p>
                
                <!-- Verification Code Box -->
                <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #d1d5db; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                  <div style="font-size: 48px; font-weight: 800; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; margin-bottom: 10px;">
                    ${code}
                  </div>
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    This code expires in 10 minutes
                  </p>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                    🔒 Security Notice
                  </h3>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                    <li>Never share this code with anyone</li>
                    <li>Global Markets staff will never ask for this code</li>
                    <li>If you didn't request this, please contact support immediately</li>
                  </ul>
                </div>
                
                <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
                  Having trouble? Contact our support team at 
                  <a href="mailto:support@globalmarketsconsulting.com" style="color: #1e40af; text-decoration: none;">
                    support@globalmarketsconsulting.com
                  </a>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
                  © 2025 Global Markets Consulting LLC<br>
                  200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131<br>
                  SEC Registered Investment Advisor
                </p>
              </div>
            </div>
          </body>
          </html>
        `

        const textContent = `
Global Markets Consulting - Verification Code

Your verification code is: ${code}

Enter this code in your browser to complete the login process.

This code expires in 10 minutes for security purposes.

SECURITY NOTICE:
- Never share this code with anyone
- Global Markets staff will never ask for this code
- If you didn't request this, please contact support immediately

Having trouble? Contact support@globalmarketsconsulting.com

© 2025 Global Markets Consulting LLC
SEC Registered Investment Advisor
        `

        // Send email using SendGrid API
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: email }],
              subject: 'Your Global Markets Verification Code'
            }],
            from: { 
              email: fromEmail,
              name: 'Global Markets Consulting'
            },
            content: [
              {
                type: 'text/plain',
                value: textContent
              },
              {
                type: 'text/html',
                value: htmlContent
              }
            ],
            tracking_settings: {
              click_tracking: { enable: false },
              open_tracking: { enable: false }
            }
          })
        })

        if (!emailResponse.ok) {
          const sendgridError = await emailResponse.json()
          console.error('❌ SendGrid API error:', sendgridError)
          
          if (sendgridError.errors?.[0]?.message?.includes('The from address does not match a verified Sender Identity')) {
            throw new Error('Email sender not verified in SendGrid. Please verify noreply@globalmarketsconsulting.com or use a verified sender.')
          }
          
          throw new Error(`Email delivery failed: ${sendgridError.errors?.[0]?.message || 'Unknown SendGrid error'}`)
        }

        console.log('✅ Email sent successfully via SendGrid')
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
        throw new Error(emailError.message || 'Failed to send email verification code')
      }
      
    } else if (method === 'sms') {
      console.log('📱 Sending SMS verification code via Twilio to:', phone)
      
      try {
        // Get Twilio credentials
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
        
        const messageBody = `Global Markets Consulting

Your verification code is: ${code}

This code expires in 10 minutes.

Never share this code with anyone. If you didn't request this, please contact support.

- Global Markets Security Team`
        
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
      timestamp: new Date().toISOString()
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