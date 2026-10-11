import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { safeNext } from '../lib/safety'
import Shell, { NeedsBackend } from './Shell'

/**
 * Email sign-in with a typed 6-digit code as well as a link.
 * NHS and university mail scanners often open links before the person does, which uses up a one-time link;
 * a typed code is not affected. The Supabase email template must include {{ .Token }} (see README).
 */
export default function Login() {
  const { session } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState(''); const [code, setCode] = useState('')
  const [sent, setSent] = useState(false); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={next} replace />

  async function send(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: location.origin + next } })
    setBusy(false)
    if (error) setErr(error.status === 429 ? 'Too many sign-in emails were sent recently. Wait a few minutes and try again.' : error.message); else setSent(true)
  }
  async function verify(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    setBusy(false)
    if (error) setErr('That code did not work. Check it matches the latest email, or send a new one.')
  }

  return (
    <Shell eyebrow="Account" title="Sign in to save your progress">
      {!supabase ? <NeedsBackend /> : !sent ? (
        <form className="card stack" onSubmit={send} style={{ maxWidth: 460 }}>
          <p className="muted">We email you a 6-digit code. No password needed. Guest progress on this device is added to your account.</p>
          <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button>
          {err && <p className="err" role="alert">{err}</p>}
        </form>
      ) : (
        <form className="card stack" onSubmit={verify} style={{ maxWidth: 460 }}>
          <p>We sent a code to <b>{email}</b>. Type it below. You can also use the link in the email if it works for you.</p>
          <label className="field"><span>6-digit code</span><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>
          <div className="row"><button className="btn primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button><button className="btn ghost" type="button" onClick={() => { setSent(false); setCode('') }}>Use a different email</button></div>
          {err && <p className="err" role="alert">{err}</p>}
          <p className="muted" style={{ fontSize: '.8rem' }}>No email after a few minutes? Check junk or quarantine folders. NHS and university mail filters sometimes hold new senders.</p>
        </form>
      )}
    </Shell>
  )
}
