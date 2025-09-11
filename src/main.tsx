console.log("🚀 App is starting...");

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("🔍 main.tsx loading...");
console.log("🔍 React imported:", !!StrictMode);
console.log("🔍 App imported:", !!App);
console.log("🔍 Environment:", {
  mode: import.meta.env.MODE,
  supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});

// Check if root element exists
const rootElement = document.getElementById('root');
console.log("🔍 Root element found:", !!rootElement);

if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element exists, creating React root...");
  
  try {
    const root = createRoot(rootElement);
    console.log("✅ React root created, rendering app...");
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      console.error('❌ Global error caught:', event.error);
      console.error('❌ Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Show error in UI instead of white screen
      if (rootElement && !rootElement.innerHTML.includes('Application Error')) {
        rootElement.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
            <div style="text-align: center; padding: 2rem;">
              <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
              <p style="color: #6b7280; margin-bottom: 1rem;">Error: ${event.message}</p>
              <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">
                Reload Page
              </button>
            </div>
          </div>
        `;
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
      
      // Show error in UI instead of white screen
      if (rootElement && !rootElement.innerHTML.includes('Application Error')) {
        rootElement.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
            <div style="text-align: center; padding: 2rem;">
              <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
              <p style="color: #6b7280; margin-bottom: 1rem;">Promise rejection: ${event.reason}</p>
              <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">
                Reload Page
              </button>
            </div>
          </div>
        `;
      }
    });

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("✅ App rendered successfully");
  } catch (error) {
    console.error("❌ Error rendering app:", error);
    
    // Fallback error display
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #6b7280; margin-bottom: 1rem;">Failed to load the application: ${error.message}</p>
            <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">
              Reload Page
            </button>
          </div>
        </div>
      `;
    }
  }
}