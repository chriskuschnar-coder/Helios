import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvestmentPlatform } from './components/InvestmentPlatform';
import { AuthProvider } from './components/auth/AuthProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <InvestmentPlatform />
    </AuthProvider>
  </StrictMode>
);
