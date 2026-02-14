import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ✅ DEFENSIVE: Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('❌ [GLOBAL] Unhandled error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.message || String(event.error),
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
  });
});

// ✅ DEFENSIVE: Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [GLOBAL] Unhandled promise rejection:', {
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
