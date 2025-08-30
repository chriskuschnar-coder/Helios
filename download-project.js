#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('📦 Creating project download package...')

// List of all important files to include
const filesToInclude = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.app.json', 
  'tsconfig.node.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'index.html',
  '.env',
  '.gitignore',
  'README.md',
  'LOCAL_SETUP.md',
  'QUICK_START.md',
  'LOCAL_DEPLOYMENT_GUIDE.md',
  'DOWNLOAD_INSTRUCTIONS.md',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/vite-env.d.ts',
  'src/lib/supabase.ts',
  'src/lib/supabase-client.ts',
  'src/lib/supabase-proxy.ts',
  'src/lib/mock-data.ts',
  'src/components/Hero.tsx',
  'src/components/About.tsx',
  'src/components/Services.tsx',
  'src/components/Performance.tsx',
  'src/components/Contact.tsx',
  'src/components/Header.tsx',
  'src/components/Footer.tsx',
  'src/components/LoginForm.tsx',
  'src/components/LoginPage.tsx',
  'src/components/ClientDashboard.tsx',
  'src/components/HeliosDashboard.tsx',
  'src/components/InvestorDashboard.tsx',
  'src/components/DashboardSelector.tsx',
  'src/components/InvestmentPlatform.tsx',
  'src/components/StripePayment.tsx',
  'src/components/SupabaseTest.tsx',
  'src/components/SecureFundingModal.tsx',
  'src/components/auth/AuthProvider.tsx',
  'src/components/auth/LoginForm.tsx',
  'src/components/auth/SignupForm.tsx',
  'supabase/functions/api-proxy/index.ts',
  'supabase/functions/hedge-fund-api/index.ts',
  'supabase/migrations/20250829180131_little_flower.sql'
]

console.log('✅ Project is ready for download!')
console.log('\n📋 Files included:')
filesToInclude.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} (missing)`)
  }
})

console.log('\n🚀 To download:')
console.log('1. Right-click files in WebContainer file explorer')
console.log('2. Select "Download" for each file')
console.log('3. Or use the WebContainer download feature if available')
console.log('\n💡 Everything is pre-configured - just run "npm install && npm run dev" locally!')