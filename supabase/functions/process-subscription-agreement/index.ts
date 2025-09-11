const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AgreementSubmission {
  agreement_data: {
    full_name: string
    email: string
    investment_amount: number
    account_number: string
    date_signed: string
    user_id: string
  }
  signature: string
  signature_type: 'typed' | 'drawn'
  ip_address: string
  user_agent: string
}

Deno.serve(async (req) => {
  console.log('📝 Processing subscription agreement')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { agreement_data, signature, signature_type, ip_address, user_agent }: AgreementSubmission = await req.json()
    
    console.log('📋 Agreement submission:', {
      user_id: agreement_data.user_id,
      full_name: agreement_data.full_name,
      signature_type,
      ip_address
    })
    
    // Validate required fields
    if (!agreement_data.user_id || !agreement_data.full_name || !signature) {
      throw new Error('Missing required agreement data or signature')
    }

    // Get user from JWT token for security
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
    
    // Ensure user matches agreement data
    if (user.id !== agreement_data.user_id) {
      throw new Error('User ID mismatch')
    }

    console.log('✅ User verified:', user.email)

    // Generate signed document content
    const signedDocumentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Agreement - ${agreement_data.full_name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
          .signature-section { border: 2px solid #1e40af; padding: 20px; margin: 20px 0; background: #f8fafc; }
          .signature { font-family: 'Brush Script MT', cursive; font-size: 24px; color: #1e40af; }
          .metadata { background: #e5e7eb; padding: 15px; margin: 20px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SUBSCRIPTION AGREEMENT</h1>
          <h2>Global Markets Consulting LLC</h2>
          <p>A Delaware Limited Liability Company</p>
        </div>
        
        <div class="metadata">
          <strong>Document Execution Details:</strong><br>
          Subscriber: ${agreement_data.full_name}<br>
          Email: ${agreement_data.email}<br>
          Account Number: ${agreement_data.account_number}<br>
          Investment Amount: $${agreement_data.investment_amount.toLocaleString()}<br>
          Date Signed: ${agreement_data.date_signed}<br>
          IP Address: ${ip_address}<br>
          Signature Method: ${signature_type === 'typed' ? 'Electronic (Typed)' : 'Electronic (Drawn)'}<br>
          Timestamp: ${new Date().toISOString()}
        </div>

        <h2>1. SUBSCRIPTION</h2>
        <p>The undersigned (the "Subscriber") hereby subscribes for membership interests in Global Markets Consulting LLC (the "Company") and agrees to contribute $${agreement_data.investment_amount.toLocaleString()} as capital to the Company.</p>

        <h2>2. REPRESENTATIONS AND WARRANTIES</h2>
        <p>The Subscriber represents and warrants that:</p>
        <ul>
          <li>The Subscriber has received and carefully reviewed the Company's Private Placement Memorandum</li>
          <li>The Subscriber understands the risks associated with this investment</li>
          <li>The Subscriber meets the definition of an "accredited investor" under federal securities laws</li>
          <li>This investment is suitable for the Subscriber's financial situation and investment objectives</li>
        </ul>

        <h2>3. INVESTMENT RISKS</h2>
        <p><strong>THE SUBSCRIBER ACKNOWLEDGES THAT:</strong> This investment involves substantial risks, including the possible loss of the entire investment. The Company's trading strategies may result in significant losses. Past performance does not guarantee future results.</p>

        <h2>4. ACCREDITED INVESTOR STATUS</h2>
        <p>By signing below, the Subscriber certifies that they qualify as an "accredited investor" as defined in Rule 501(a) of Regulation D under the Securities Act of 1933, as amended.</p>

        <h2>5. GOVERNING LAW</h2>
        <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.</p>

        <h2>6. ELECTRONIC SIGNATURE</h2>
        <p>The Subscriber agrees that electronic signatures shall have the same legal effect as handwritten signatures and that this Agreement may be executed electronically.</p>

        <div class="signature-section">
          <h3>SUBSCRIBER SIGNATURE</h3>
          <p><strong>Signature:</strong></p>
          ${signature_type === 'typed' 
            ? `<div class="signature">${signature}</div>` 
            : `<img src="${signature}" alt="Electronic Signature" style="max-height: 100px; border: 1px solid #ccc;">`
          }
          <br>
          <p><strong>Print Name:</strong> ${agreement_data.full_name}</p>
          <p><strong>Date:</strong> ${agreement_data.date_signed}</p>
          <p><strong>Email:</strong> ${agreement_data.email}</p>
          <p><strong>Account Number:</strong> ${agreement_data.account_number}</p>
        </div>

        <div class="metadata">
          <strong>Electronic Signature Verification:</strong><br>
          This document was signed electronically using secure authentication.<br>
          Signature captured on: ${new Date().toISOString()}<br>
          IP Address: ${ip_address}<br>
          User Agent: ${user_agent.substring(0, 100)}...<br>
          Document Hash: ${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(agreement_data.user_id + agreement_data.date_signed)).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16))}
        </div>
      </body>
      </html>
    `

    // Store signed document in Supabase Storage
    console.log('💾 Storing signed document in Supabase Storage...')
    
    // Convert HTML to base64 for storage
    const documentBlob = new Blob([signedDocumentHtml], { type: 'text/html' })
    const documentBuffer = await documentBlob.arrayBuffer()
    
    const fileName = `subscription_agreement_${agreement_data.user_id}_${Date.now()}.html`
    const filePath = `agreements/${agreement_data.user_id}/${fileName}`
    
    // Store in Supabase Storage
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, documentBuffer, {
        contentType: 'text/html',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Failed to upload signed document:', uploadError)
      throw new Error('Failed to store signed document')
    }

    console.log('✅ Signed document uploaded:', uploadData.path)

    // Get public URL for the signed document
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const signedDocumentUrl = urlData.publicUrl

    // STEP 1: Update users table with signature completion
    console.log('📝 Updating user subscription status...')
    const userUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${agreement_data.user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        subscription_signed_at: new Date().toISOString(),
        subscription_signed_url: signedDocumentUrl,
        updated_at: new Date().toISOString()
      })
    })

    if (!userUpdateResponse.ok) {
      console.error('❌ Failed to update user subscription status')
      throw new Error('Failed to update user subscription status')
    }

    // STEP 2: Create signed document record
    console.log('📄 Creating signed document record...')
    const documentResponse = await fetch(`${supabaseUrl}/rest/v1/signed_documents`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: agreement_data.user_id,
        document_id: `SUB-${agreement_data.account_number}`,
        document_title: 'Subscription Agreement',
        document_type: 'subscription_agreement',
        signature: signature,
        signed_at: new Date().toISOString(),
        ip_address: ip_address,
        user_agent: user_agent,
        metadata: {
          signature_type: signature_type,
          investment_amount: agreement_data.investment_amount,
          account_number: agreement_data.account_number,
          document_url: signedDocumentUrl,
          full_name: agreement_data.full_name,
          email: agreement_data.email
        }
      })
    })

    if (!documentResponse.ok) {
      console.error('❌ Failed to create signed document record')
      throw new Error('Failed to create document record')
    }

    const documentRecord = await documentResponse.json()
    console.log('✅ Signed document record created:', documentRecord[0]?.id)

    console.log('🎉 Subscription agreement processing complete!')

    return new Response(JSON.stringify({
      success: true,
      signed_document_url: signedDocumentUrl,
      document_id: documentRecord[0]?.id,
      message: 'Subscription agreement signed successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Subscription agreement processing error:', error)
    
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