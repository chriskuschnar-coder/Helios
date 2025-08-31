import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client server-side
const supabaseUrl = process.env.SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5NjI4NzEsImV4cCI6MjA0MDUzODg3MX0.VJJOq8_wIsUpJy4Rqy-yZ8u9HqFz7L2UwNMJgNaWF6I'

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('🔄 Proxy request:', req.method, req.url, 'Body:', req.body)

  try {
    // Simple test connection endpoint
    if (req.url === '/test-connection' || req.url.endsWith('test-connection')) {
      console.log('🔄 Testing Supabase connection...')
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Supabase test failed:', error)
        return res.status(500).json({ error: error.message, success: false })
      }
      
      console.log('✅ Supabase connection successful')
      return res.json({ success: true, message: 'Connection successful', data })
    }

    // Auth signin endpoint
    if (req.url.endsWith('auth/signin')) {
      const { email, password } = req.body
      console.log('🔐 Auth signin request for:', email)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        console.error('❌ Auth signin failed:', authError)
        return res.status(400).json({ error: authError.message, data: null })
      }
      
      console.log('✅ Auth signin successful')
      return res.json({ data: authData, error: null })
    }

    // Auth signup endpoint
    if (req.url.endsWith('auth/signup')) {
      const { email, password, metadata } = req.body
      console.log('📝 Auth signup request for:', email)
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
      
      if (signupError) {
        console.error('❌ Auth signup failed:', signupError)
        return res.status(400).json({ error: signupError.message, data: null })
      }
      
      console.log('✅ Auth signup successful')
      return res.json({ data: signupData, error: null })
    }

    // Users table query
    if (req.url.endsWith('/users')) {
      console.log('👥 Users query request')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10)
      
      if (error) {
        console.error('❌ Users query failed:', error)
        return res.status(500).json({ error: error.message, data: null })
      }
      
      console.log('✅ Users query successful')
      return res.json({ data, error: null })
    }

    // Default fallback
    console.log('❓ Unknown endpoint:', req.url)
    return res.status(404).json({ 
      error: 'Endpoint not found: ' + req.url,
      available_endpoints: [
        '/test-connection',
        '/auth/signin', 
        '/auth/signup',
        '/users'
      ]
    })

  } catch (error) {
    console.error('❌ Supabase proxy error:', error)
    return res.status(500).json({ 
      error: error.message,
      type: 'proxy_error'
    })
  }
}