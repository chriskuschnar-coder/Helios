const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/hedge-fund-api/', '')
    
    // Get Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    console.log(`Processing request: ${req.method} ${path}`)

    let result

    // Authentication endpoints
    if (path === 'auth/signin') {
      const { email, password } = await req.json()
      
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      })
      
      const authData = await authResponse.json()
      result = { 
        data: authData.access_token ? { user: authData.user, session: authData } : null,
        error: authData.error || (!authData.access_token ? { message: 'Invalid credentials' } : null),
        success: !!authData.access_token 
      }
    } 
    else if (path === 'auth/signup') {
      const { email, password, metadata } = await req.json()
      
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ 
          email, 
          password,
          data: metadata || {}
        }),
      })
      
      const authData = await authResponse.json()
      result = { 
        data: authData,
        error: authData.error || null,
        success: !authData.error 
      }
    }
    else if (path === 'auth/signout') {
      // For signout, we just return success since it's client-side
      result = { error: null, success: true }
    }
    
    // Database endpoints
    else if (path === 'users') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      
      if (req.method === 'GET') {
        const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=10`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        result = { 
          data: response.ok ? data : null, 
          error: response.ok ? null : data,
          success: response.ok 
        }
      }
    }
    else if (path === 'accounts') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      
      if (req.method === 'GET') {
        // Get user ID from token first
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (!userResponse.ok) {
          result = { data: null, error: { message: 'Unauthorized' }, success: false }
        } else {
          const userData = await userResponse.json()
          
          const response = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userData.id}&select=*`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          const data = await response.json()
          result = { 
            data: response.ok ? (Array.isArray(data) ? data[0] : data) : null, 
            error: response.ok ? null : data,
            success: response.ok 
          }
        }
      }
    }
    else if (path === 'transactions') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      
      if (req.method === 'GET') {
        // Get user ID from token first
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (!userResponse.ok) {
          result = { data: null, error: { message: 'Unauthorized' }, success: false }
        } else {
          const userData = await userResponse.json()
          
          const response = await fetch(`${supabaseUrl}/rest/v1/transactions?user_id=eq.${userData.id}&select=*&order=created_at.desc&limit=10`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          const data = await response.json()
          result = { 
            data: response.ok ? data : null, 
            error: response.ok ? null : data,
            success: response.ok 
          }
        }
      }
    }
    else if (path === 'test-connection') {
      // Simple connection test
      const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      result = { 
        data: response.ok ? data : null, 
        error: response.ok ? null : data,
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    }
    else if (path === 'accounts/user') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      
      // Get user ID from token first
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!userResponse.ok) {
        result = { data: null, error: { message: 'Unauthorized' }, success: false }
      } else {
        const userData = await userResponse.json()
        
        const response = await fetch(`${supabaseUrl}/rest/v1/accounts?user_id=eq.${userData.id}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        result = { 
          data: response.ok ? (Array.isArray(data) ? data[0] : data) : null, 
          error: response.ok ? null : data,
          success: response.ok 
        }
      }
    }
    else if (path === 'transactions/user') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      const urlParams = new URLSearchParams(url.search)
      const limit = urlParams.get('limit') || '10'
      
      // Get user ID from token first
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!userResponse.ok) {
        result = { data: null, error: { message: 'Unauthorized' }, success: false }
      } else {
        const userData = await userResponse.json()
        
        const response = await fetch(`${supabaseUrl}/rest/v1/transactions?user_id=eq.${userData.id}&select=*&order=created_at.desc&limit=${limit}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        result = { 
          data: response.ok ? data : null, 
          error: response.ok ? null : data,
          success: response.ok 
        }
      }
    }
    else if (path === 'funding/process') {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || supabaseAnonKey
      const { amount, method, description } = await req.json()
      
      // Get user ID from token first
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!userResponse.ok) {
        result = { data: null, error: { message: 'Unauthorized' }, success: false }
      } else {
        const userData = await userResponse.json()
        
        // Call the funding function
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/process_funding_transaction`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_user_id: userData.id,
            p_amount: amount,
            p_method: method,
            p_description: description || 'Account funding'
          })
        })
        
        const data = await response.json()
        result = { 
          data: response.ok ? data : null, 
          error: response.ok ? null : data,
          success: response.ok 
        }
      }
    }
    else {
      result = { 
        error: { message: `Unknown endpoint: ${path}` }, 
        success: false 
      }
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: { message: error.message }, 
        success: false 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})