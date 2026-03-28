// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Sacamos esto de AppRouter
import './index.css'
import App from './app/App.jsx'
import { AuthProvider } from './features/auth/AuthContext' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- El Router envuelve a TODO ahora */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)