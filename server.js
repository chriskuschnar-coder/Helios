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

// API routes
app.all('/api/supabase-proxy', supabaseProxy)
app.all('/api/supabase-proxy/*', supabaseProxy)

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📱 App: http://localhost:${port}`)
  console.log(`🔧 API: http://localhost:${port}/api/supabase-proxy`)
})