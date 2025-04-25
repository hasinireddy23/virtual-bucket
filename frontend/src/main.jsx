import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster 
  position="top-center"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#fff',
      color: '#333',
      fontWeight: '500',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
  }}
/>
    <App />
  </StrictMode>,
)
