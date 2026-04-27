import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './geist-fonts.css'
import './index.css'
import { FontProvider } from './FontContext'
import { UISettingsProvider } from './UISettingsContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FontProvider>
      <UISettingsProvider>
        <App />
      </UISettingsProvider>
    </FontProvider>
  </StrictMode>,
)
