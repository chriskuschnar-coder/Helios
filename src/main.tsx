import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvestmentPlatform } from './components/InvestmentPlatform';
import { AuthProvider } from './components/auth/AuthProvider';
import './index.css';

// DEBUG: Check if main.tsx is loading
console.log('🔍 main.tsx loading...')
console.log('🔍 AuthProvider import:', !!AuthProvider)
console.log('🔍 InvestmentPlatform import:', !!InvestmentPlatform)

// Error boundary wrapper
function App() {
  console.log('🔍 App component rendering...')
  return (
    <StrictMode>
      <AuthProvider>
        {console.log('🔍 AuthProvider wrapper rendering...')}
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
