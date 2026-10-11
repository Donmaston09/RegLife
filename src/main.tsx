// RegLife. Created by Anthony Onoja, Ph.D., School of Health Sciences, University of Surrey.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Fonts are served from the app itself, so no learner data goes to a font host
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
