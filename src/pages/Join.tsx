import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { joinCohort } from '../lib/cohorts'
import { supabase } from '../lib/supabase'
import Shell, { NeedsBackend } from './Shell'

export default function Join() {
  const { code = '' } = useParams()
  const { session, loading } = useAuth()
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('')
  useEffect(() => { if (session) joinCohort(code).then(c => setMsg(`You joined ${c.name}.`)).catch(e => setErr((e as Error).message)) }, [session, code])
  if (!supabase) return <Shell eyebrow="Cohort" title="Join a cohort"><NeedsBackend /></Shell>
  if (loading) return null
  if (!session) return <Navigate to={`/signup?next=/join/${encodeURIComponent(code)}`} replace />
  return (
    <Shell eyebrow="Cohort" title="Join a cohort">
      <div className="card stack" style={{ maxWidth: 520 }}>
        {msg && <><p className="ok">{msg}</p><p>Your educator will see your progress from today.</p><Link className="btn primary" to="/" style={{ textDecoration: 'none', width: 'max-content' }}>Go to the city</Link></>}
        {err && <p className="err">{err}</p>}
        {!msg && !err && <p className="muted">Joining…</p>}
      </div>
    </Shell>
  )
}
