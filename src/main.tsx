import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvestmentPlatform } from './components/InvestmentPlatform';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InvestmentPlatform />
  </StrictMode>
);
