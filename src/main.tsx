import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/global.css'
import App from './App.tsx'

// 日本語フォントの大きな unicode-range 定義は初期CSSから分離する。
// 読み込み中は tokens.css のシステムフォントへフォールバックする。
void import('./styles/loadFonts.ts').catch(() => undefined)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
