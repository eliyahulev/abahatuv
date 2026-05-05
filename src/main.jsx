import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { UserDataProvider } from './hooks/useUserData.jsx'
import './styles.scss'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UserDataProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </UserDataProvider>
    </AuthProvider>
  </React.StrictMode>
)
