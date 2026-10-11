import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './lib/auth'
import { hasBackend } from './lib/supabase'
import { progressStore } from './lib/progress'
import CityPage from './pages/CityPage'
import AuthForm from './pages/AuthForm'
import Welcome from './pages/Welcome'
import Privacy from './pages/Privacy'
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

/** With a backend configured, the app is for signed-in users only. Without one (local development), it runs in guest mode. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const loc = useLocation()
  if (!hasBackend) return <>{children}</>
  if (loading) return <main className="page" style={{ display: 'grid', placeItems: 'center' }}><p className="muted">Loading…</p></main>
  if (!session) { const next = loc.pathname + loc.search + loc.hash; return <Navigate to={next === '/' ? '/welcome' : `/welcome?next=${encodeURIComponent(next)}`} replace /> }
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressSync />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signup" element={<AuthForm mode="signup" />} />
          <Route path="/login" element={<AuthForm mode="signin" />} />
          <Route path="/reset" element={<AuthForm mode="reset" />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/" element={<RequireAuth><CityPage /></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/educator" element={<RequireAuth><Educator /></RequireAuth>} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="*" element={<Shell eyebrow="404" title="That page is not in the city"><p>Head back to the city to keep exploring.</p></Shell>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
