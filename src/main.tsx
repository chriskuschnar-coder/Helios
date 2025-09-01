console.log("🚀 App is starting...");

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("🔍 main.tsx loading...");
console.log("🔍 React imported:", !!StrictMode);
console.log("🔍 App imported:", !!App);

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
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("✅ App rendered successfully");
  } catch (error) {
    console.error("❌ Error rendering app:", error);
  }
}