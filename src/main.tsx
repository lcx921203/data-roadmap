import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/app.css'
import './styles/iceberg-spine.css'
import './styles/frontstage-cleanup.css'
import './styles/discovery-refine.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
