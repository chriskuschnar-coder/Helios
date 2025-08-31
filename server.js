import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import supabaseProxy from './api/supabase-proxy.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.static('dist'))

// API routes - handle all supabase proxy requests
app.all('/api/supabase-proxy*', (req, res) => {
  // Remove the /api/supabase-proxy prefix and pass to handler
  req.url = req.url.replace('/api/supabase-proxy', '')
  if (!req.url) req.url = '/'
  
  console.log('🔄 Server routing to proxy:', req.url)
  supabaseProxy(req, res)
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📱 App: http://localhost:${port}`)
  console.log(`🔧 API: http://localhost:${port}/api/supabase-proxy`)
})