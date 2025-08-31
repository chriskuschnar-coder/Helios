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

  console.log('🔄 Proxy request:', req.method, req.url, req.body)

  const { method, body } = req
  const { action, table, data, filters } = body || {}

  try {
    switch (action) {
      case 'test-connection':
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (testError) throw testError
        return res.json({ success: true, message: 'Connection successful' })

      case 'auth-signin':
        const { email, password } = data
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (authError) throw authError
        return res.json({ data: authData, error: null })

      case 'auth-signup':
        const { email: signupEmail, password: signupPassword, metadata } = data
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: { data: metadata }
        })
        
        if (signupError) throw signupError
        return res.json({ data: signupData, error: null })

      case 'select':
        let query = supabase.from(table).select(data.columns || '*')
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (key === 'eq') {
              query = query.eq(value.column, value.value)
            } else if (key === 'limit') {
              query = query.limit(value)
            }
          })
        }
        
        const { data: selectData, error: selectError } = data.single 
          ? await query.single()
          : await query
        
        if (selectError) throw selectError
        return res.json({ data: selectData, error: null })

      case 'insert':
        const { data: insertData, error: insertError } = await supabase
          .from(table)
          .insert(data.values)
          .select()
        
        if (insertError) throw insertError
        return res.json({ data: insertData, error: null })

      case 'update':
        const { data: updateData, error: updateError } = await supabase
          .from(table)
          .update(data.values)
          .eq(data.where.column, data.where.value)
        
        if (updateError) throw updateError
        return res.json({ data: updateData, error: null })

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('Supabase proxy error:', error)
    return res.status(500).json({ error: error.message })
  }
}