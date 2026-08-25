// Updated: 2026-08-22
// Main entry point

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import '@/i18n'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
