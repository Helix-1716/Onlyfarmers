import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import FirebaseCheck from './FirebaseCheck';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseCheck>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseCheck>
    </ErrorBoundary>
  </StrictMode>,
)
