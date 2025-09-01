import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// IMMEDIATE DEBUG - Check what Vite is loading
console.log('🔍 ENVIRONMENT VARIABLE DEBUG:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('All VITE_ variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')))
console.log('Raw import.meta.env:', import.meta.env)

import { InvestmentPlatform } from './components/InvestmentPlatform';
import { AuthProvider } from './components/auth/AuthProvider';
import './index.css';

// Error boundary wrapper
function App() {
  return (
    <StrictMode>
      <AuthProvider>
        <InvestmentPlatform />
      </AuthProvider>
    </StrictMode>
  )
}

// Safe rendering with error handling
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  createRoot(rootElement).render(<App />)
  console.log('✅ React app mounted successfully')
} catch (error) {
  console.error('❌ Failed to mount React app:', error)
  
  // Fallback: show basic error message
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui;">
        <div style="text-align: center; max-width: 400px; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            The application failed to load. Please check the browser console for details.
          </p>
          <button onclick="window.location.reload()" style="background: #1e40af; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `
  }
}
