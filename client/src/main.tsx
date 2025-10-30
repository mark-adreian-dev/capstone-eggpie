import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import ProcessSettingsState from './context/ProcessSettingsState.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter >
      <ProcessSettingsState>
        <App />
      </ProcessSettingsState>
    </BrowserRouter>
  </StrictMode>,
)
