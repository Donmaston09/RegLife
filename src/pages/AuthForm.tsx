// Sign up, sign in and reset password with email and password. Created by Anthony Onoja, Ph.D., University of Surrey.
// Emailed 6-digit codes are used only once: to confirm a new account and to reset a forgotten password.
// Codes rather than links, because NHS and university mail scanners often open links before the person does.
// The Supabase "Confirm signup" and "Reset Password" email templates must include {{ .Token }} (see README).
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { safeNext } from '../lib/safety'
import Shell, { NeedsBackend } from './Shell'

type Mode = 'signup' | 'signin' | 'reset'
const MIN_PW = 8

function PasswordField({ id, label, value, set, autoComplete }: { id: string; label: string; value: string; set: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <label className="field"><span>{label}</span>
      <span className="pw">
        <input id={id} type={show ? 'text' : 'password'} required minLength={MIN_PW} autoComplete={autoComplete} value={value} onChange={e => set(e.target.value)} />
        <button type="button" className="linkbtn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
      </span>
    </label>
  )
}

const friendly = (m: string): string => {
  if (/invalid login credentials/i.test(m)) return 'That email and password do not match. Check them, or reset your password.'
  if (/rate limit|too many/i.test(m)) return 'Too many emails have been sent recently. Wait a few minutes and try again.'
  if (/already registered|already exists/i.test(m)) return 'An account with this email already exists. Sign in instead, or reset your password.'
  if (/password should be|weak/i.test(m)) return `Choose a stronger password of at least ${MIN_PW} characters.`
  if (/token has expired|invalid/i.test(m)) return 'That code did not work. Check it matches the latest email, or send a new one.'
  return m
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const { session } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const q = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [name, setName] = useState(''); const [org, setOrg] = useState(''); const [agree, setAgree] = useState(false)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [err, setErr] = useState<ReactNode>(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false)

  if (session && mode !== 'reset') return <Navigate to={next} replace />

  async function signUp(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    if (pw !== pw2) { setErr('The two passwords do not match.'); return }
    setBusy(true)
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pw, options: { emailRedirectTo: location.origin + next, data: { display_name: name.trim(), organisation: org.trim() } } })
    setBusy(false)
    if (error) { setErr(friendly(error.message)); return }
    // Supabase returns a user with no identities when the email is already registered
    if (data.user && data.user.identities && data.user.identities.length === 0) { setErr(<>An account with this email already exists. <Link to={`/login${q}`}>Sign in</Link> or <Link to="/reset">reset your password</Link>.</>); return }
    if (data.session) return // email confirmation is switched off: signed in straight away
    setStep('code'); setInfo('We sent a 6-digit code to confirm your email. You only need to do this once.')
  }

  async function signIn(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
    setBusy(false)
    if (!error) return
    if (/email not confirmed/i.test(error.message)) {
      setErr(''); setStep('code'); setInfo('Your email is not confirmed yet. Enter the code from your sign-up email, or send a new one.')
    } else setErr(<>{friendly(error.message)} <Link to="/reset">Forgot your password?</Link></>)
  }

  async function confirmCode(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'signup' })
    setBusy(false)
    if (error) setErr(friendly(error.message))
  }

  async function resend() {
    if (!supabase) return
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: location.origin + next } })
    setBusy(false)
    if (error) setErr(friendly(error.message)); else setInfo('We sent a new code.')
  }

  async function sendReset(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + '/reset' })
    setBusy(false)
    if (error) { setErr(friendly(error.message)); return }
    setStep('code'); setInfo('If an account exists for that email, we have sent a 6-digit code. Enter it with your new password.')
  }

  async function finishReset(e: FormEvent) {
    e.preventDefault(); setErr(''); if (!supabase) return
    if (pw !== pw2) { setErr('The two passwords do not match.'); return }
    setBusy(true)
    if (!session) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' })
      if (error) { setBusy(false); setErr(friendly(error.message)); return }
    }
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) { setErr(friendly(error.message)); return }
    nav('/', { replace: true })
  }

  const footer = mode === 'signup' ? <>Already have an account? <Link to={`/login${q}`}>Sign in</Link></>
    : mode === 'signin' ? <>New to RegLife? <Link to={`/signup${q}`}>Create an account</Link> · <Link to="/reset">Forgot your password?</Link></>
    : <><Link to={`/login${q}`}>Back to sign in</Link></>

  let body: ReactNode
  if (!supabase) body = <NeedsBackend />
  else if (mode === 'reset' && (step === 'code' || session)) body = (
    <form className="card stack" onSubmit={finishReset} style={{ maxWidth: 480 }}>
      {info && <p>{info}</p>}
      {session ? <p className="muted">Choose a new password for your account.</p> : <>
        <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="field"><span>6-digit code from the email</span><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>
      </>}
      <PasswordField id="pw" label={`New password (at least ${MIN_PW} characters)`} value={pw} set={setPw} autoComplete="new-password" />
      <PasswordField id="pw2" label="Type the new password again" value={pw2} set={setPw2} autoComplete="new-password" />
      <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form>)
  else if (step === 'code') body = (
    <form className="card stack" onSubmit={confirmCode} style={{ maxWidth: 480 }}>
      <p>{info}</p>
      <p className="muted">Sent to <b>{email}</b>. You can also click the link in the email.</p>
      <label className="field"><span>6-digit code</span><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /></label>
      <div className="row"><button className="btn primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Confirm email'}</button><button className="btn ghost" type="button" onClick={resend} disabled={busy}>Send a new code</button></div>
      {err && <p className="err" role="alert">{err}</p>}
      <p className="muted" style={{ fontSize: '.8rem' }}>No email after a few minutes? Check junk or quarantine folders. NHS and university mail filters sometimes hold new senders.</p>
    </form>)
  else if (mode === 'reset') body = (
    <form className="card stack" onSubmit={sendReset} style={{ maxWidth: 480 }}>
      <p className="muted">Enter your account email. We will send a 6-digit code so you can choose a new password. If you first joined with an email code and never set a password, use this to set one.</p>
      <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a reset code'}</button>
      {err && <p className="err" role="alert">{err}</p>}
      <p className="muted" style={{ fontSize: '.86rem' }}>{footer}</p>
    </form>)
  else if (mode === 'signup') body = (
    <form className="card stack" onSubmit={signUp} style={{ maxWidth: 480 }}>
      <p className="muted">Create a free account to save your progress, join a course cohort and keep the documents you make.</p>
      <label className="field"><span>Your name</span><input id="name" required maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="field"><span>Organisation or course <span className="muted">(optional)</span></span><input id="org" maxLength={120} autoComplete="organization" value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. Northfield NHS Trust, MSc Digital Health" /></label>
      <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <PasswordField id="pw" label={`Password (at least ${MIN_PW} characters)`} value={pw} set={setPw} autoComplete="new-password" />
      <PasswordField id="pw2" label="Type the password again" value={pw2} set={setPw2} autoComplete="new-password" />
      <label className="chk"><input type="checkbox" required checked={agree} onChange={e => setAgree(e.target.checked)} /><span>I have read the <Link to="/privacy" target="_blank">privacy notice</Link> and understand RegLife is an educational tool, not legal advice.</span></label>
      <button className="btn primary" type="submit" disabled={busy || !agree}>{busy ? 'Creating…' : 'Create account'}</button>
      {err && <p className="err" role="alert">{err}</p>}
      <p className="muted" style={{ fontSize: '.86rem' }}>{footer}</p>
    </form>)
  else body = (
    <form className="card stack" onSubmit={signIn} style={{ maxWidth: 480 }}>
      <label className="field"><span>Email address</span><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      <PasswordField id="pw" label="Password" value={pw} set={setPw} autoComplete="current-password" />
      <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      {err && <p className="err" role="alert">{err}</p>}
      <p className="muted" style={{ fontSize: '.86rem' }}>{footer}</p>
    </form>)

  const titles: Record<Mode, [string, string]> = { signup: ['Create an account', 'Join RegLife'], signin: ['Sign in', 'Welcome back'], reset: ['Password', session ? 'Choose a new password' : 'Reset your password'] }
  return <Shell eyebrow={titles[mode][0]} title={titles[mode][1]}>{body}</Shell>
}
