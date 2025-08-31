import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Create Supabase client on server side (has network access)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🚀 Supabase Proxy Server starting...')
console.log('📡 Supabase URL:', process.env.VITE_SUPABASE_URL)
console.log('🔑 Anon Key present:', !!process.env.VITE_SUPABASE_ANON_KEY)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase_configured: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY)
  })
})

// Auth endpoints
app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    console.log('🔐 Sign in attempt for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.log('❌ Sign in failed:', error.message)
      return res.status(400).json({ error: error.message })
    }
    
    console.log('✅ Sign in successful')
    res.json({ data, error: null })
  } catch (err) {
    console.error('❌ Sign in error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, metadata } = req.body
    console.log('📝 Sign up attempt for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) {
      console.log('❌ Sign up failed:', error.message)
      return res.status(400).json({ error: error.message })
    }
    
    console.log('✅ Sign up successful')
    res.json({ data, error: null })
  } catch (err) {
    console.error('❌ Sign up error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/auth/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    res.json({ error })
  } catch (err) {
    console.error('❌ Sign out error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Database endpoints
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    res.json({ data, error })
  } catch (err) {
    console.error('❌ Users query error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    res.json({ data, error })
  } catch (err) {
    console.error('❌ Accounts query error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/transactions', async (req, res) => {
  try {
    const transaction = req.body
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()
    
    res.json({ data, error })
  } catch (err) {
    console.error('❌ Transaction insert error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    res.json({ data, error })
  } catch (err) {
    console.error('❌ Account update error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`🌐 Supabase proxy server running on http://localhost:${PORT}`)
  console.log('🔗 Frontend can now make requests to this proxy instead of direct Supabase calls')
})