import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/app.css'
import './styles/iceberg-spine.css'
import './styles/frontstage-cleanup.css'
import './styles/discovery-refine.css'
import './styles/evidence-discovery-polish.css'
import './styles/ui-conformance-v1.1.css'
import './styles/interview-semantics-v1.2.css'
import './styles/motion-metadata-v1.3.css'
import './styles/diagram-system-v1.css'
import './styles/three-tab-product.css'
import './styles/scale-detail-v1.css'
import './styles/interview-integration-v1.css'
import './styles/cross-navigation-v1.css'
import './styles/reading-navigation-v1.7.css'
import './styles/one-hand-reading-v1.7.1.css'
import './styles/directory-polish-v1.7.2.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
