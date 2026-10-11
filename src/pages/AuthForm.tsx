// Sign up and sign in with an emailed 6-digit code. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { safeNext } from '../lib/safety'
import Shell, { NeedsBackend } from './Shell'

/**
 * Codes rather than links: NHS and university mail scanners often open links before the person does.
 * The Supabase "Confirm signup" and "Magic Link" email templates must include {{ .Token }} (see README).
 */
export default function AuthForm({ mode }: { mode: 'signup' | 'signin' }) {
  const { session } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const q = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [org, setOrg] = useState('')
  const [agree, setAgree] = useState(false); const [code, setCode] = useState('')
  const [sent, setSent] = useState(false); const [err, setErr] = useState<React.ReactNode>(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={next} replace />
  const signup = mode === 'signup'

  async function send(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: signup
        ? { shouldCreateUser: true, emailRedirectTo: location.origin + next, data: { display_name: name.trim(), organisation: org.trim() } }
        : { shouldCreateUser: false, emailRedirectTo: location.origin + next }
    })
    setBusy(false)
    if (!error) { setSent(true); return }
    if (!signup && /signups? not allowed|not found|otp_disabled/i.test(error.message)) setErr(<>There is no RegLife account for that email. <Link to={`/signup${q}`}>Create an account</Link>.</>)
    else if (error.status === 429) setErr('Too many emails were sent recently. Wait a few minutes and try again.')
    else setErr(error.message)
  }
  async function verify(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
    setBusy(false)
    if (error) setErr('That code did not work. Check it matches the latest email, or send a new one.')
  }

  return (
    <Shell eyebrow={signup ? 'Create an account' : 'Sign in'} title={signup ? 'Join RegLife' : 'Welcome back'}>
      {!supabase ? <NeedsBackend /> : !sent ? (
        <form className="card stack" onSubmit={send} style={{ maxWidth: 480 }}>
          {signup ? <p className="muted">Create a free account to save your progress, join a course cohort and keep the documents you make. We email you a 6-digit code, so there is no password to remember.</p>
            : <p className="muted">Enter the email you signed up with. We will send you a 6-digit code.</p>}
          {signup && <>
            <label className="field"><span>Your name</span><input id="name" required maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>
            <label className="field"><span>Organisation or course <span className="muted">(optional)</span></span><input id="org" maxLength={120} autoComplete="organization" value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. Northfield NHS Trust, MSc Digital Health" /></label>
          </>}
          <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          {signup && <label className="chk"><input type="checkbox" required checked={agree} onChange={e => setAgree(e.target.checked)} /><span>I have read the <Link to="/privacy" target="_blank">privacy notice</Link> and understand RegLife is an educational tool, not legal advice.</span></label>}
          <button className="btn primary" type="submit" disabled={busy || (signup && !agree)}>{busy ? 'Sending…' : signup ? 'Create account' : 'Email me a code'}</button>
          {err && <p className="err" role="alert">{err}</p>}
          <p className="muted" style={{ fontSize: '.86rem' }}>{signup ? <>Already have an account? <Link to={`/login${q}`}>Sign in</Link></> : <>New to RegLife? <Link to={`/signup${q}`}>Create an account</Link></>}</p>
        </form>
      ) : (
        <form className="card stack" onSubmit={verify} style={{ maxWidth: 480 }}>
          <p>We sent a code to <b>{email}</b>. Type it below{signup ? ' to finish creating your account' : ''}. You can also use the link in the email.</p>
          <label className="field"><span>6-digit code</span><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>
          <div className="row"><button className="btn primary" type="submit" disabled={busy}>{busy ? 'Checking…' : signup ? 'Finish sign-up' : 'Sign in'}</button><button className="btn ghost" type="button" onClick={() => { setSent(false); setCode('') }}>Use a different email</button></div>
          {err && <p className="err" role="alert">{err}</p>}
          <p className="muted" style={{ fontSize: '.8rem' }}>No email after a few minutes? Check junk or quarantine folders. NHS and university mail filters sometimes hold new senders.</p>
        </form>
      )}
    </Shell>
  )
}
