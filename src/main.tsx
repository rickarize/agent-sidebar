import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './geist-fonts.css'
import './index.css'
import { FontProvider } from './FontContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FontProvider>
      <App />
    </FontProvider>
  </StrictMode>,
)
