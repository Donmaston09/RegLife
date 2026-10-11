import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { progressStore } from './lib/progress'
import CityPage from './pages/CityPage'
import Login from './pages/Login'
import Account from './pages/Account'
import Educator from './pages/Educator'
import Join from './pages/Join'
import Shell from './pages/Shell'

function ProgressSync() {
  const { session } = useAuth()
  const uid = session?.user.id ?? null
  useEffect(() => { progressStore.attach(uid) }, [uid])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressSync />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CityPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/educator" element={<Educator />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="*" element={<Shell eyebrow="404" title="That page is not in the city"><p>Head back to the city to keep exploring.</p></Shell>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
