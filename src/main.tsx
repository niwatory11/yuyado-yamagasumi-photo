import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// セルフホストフォント(unicode-rangeスライス配信)
import '@fontsource/zen-old-mincho/600.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/500.css'

import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
