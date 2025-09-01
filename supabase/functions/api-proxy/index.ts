import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/api-proxy/', '')
    const method = req.method
    
    // Initialize Supabase client with service role for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let result

    // Route different API calls
    if (path === 'test-connection') {
      // Simple connection test
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at')
        .limit(1)
      
      result = { data, error, success: !error }
    } else if (path === 'auth/signin') {
      // Handle sign in
      const { email, password } = await req.json()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      result = { data, error, success: !error }
    } else if (path === 'auth/signup') {
      // Handle sign up
      const { email, password, metadata } = await req.json()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
      result = { data, error, success: !error }
    } else if (path === 'auth/signout') {
      // Handle sign out
      const { error } = await supabase.auth.signOut()
      result = { error, success: !error }
    } else if (path === 'accounts') {
      // Handle account queries
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        throw new Error('Authorization header required')
      }
      
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: userError } = await supabase.auth.getUser(token)
      
      if (userError || !user) {
        throw new Error('Invalid token')
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      result = { data, error, success: !error }
    } else if (path === 'transactions') {
      // Handle transaction queries
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        throw new Error('Authorization header required')
      }
      
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: userError } = await supabase.auth.getUser(token)
      
      if (userError || !user) {
        throw new Error('Invalid token')
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      result = { data, error, success: !error }
    } else {
      throw new Error(`Unknown endpoint: ${path}`)
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