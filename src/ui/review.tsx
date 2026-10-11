// Review badges, "report an error" and the regulatory updates log. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useState, type FormEvent } from 'react'
import { fmtDate, isDue, reviewOf, type ContentKind } from '../content/review'
import { comingUp, recentUpdates, type RegUpdate } from '../content/updates'
import { BY_ID } from '../content/city'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Disclaimer, Pill } from './views'

export function ReviewBadge({ kind, id }: { kind: ContentKind; id: string }) {
  const r = reviewOf(kind, id)
  const due = isDue(r)
  return (
    <span className="row" style={{ gap: 6 }}>
      <span className="pill" title={`Reviewer: ${r.reviewer}`}>Checked {fmtDate(r.lastReviewed)}</span>
      {due ? <Pill l="hi">Due for review</Pill> : r.status === 'expert' ? <Pill l="lo">Expert reviewed</Pill> : <Pill l="mid">Awaiting expert review</Pill>}
    </span>
  )
}

export function ReportButton({ kind, id, label }: { kind: ContentKind; id: string; label: string }) {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(''); const [src, setSrc] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [err, setErr] = useState('')
  async function send(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !session) { setState('error'); setErr('Sign in to send a report.'); return }
    setState('sending')
    const { error } = await supabase.from('content_reports').insert({ content_kind: kind, content_id: id, message: msg.trim(), source_url: src.trim() || null })
    if (error) { setState('error'); setErr(error.message) } else { setState('sent'); setMsg(''); setSrc('') }
  }
  if (state === 'sent') return <p className="ok" role="status">Thank you. Your report on {label} has been sent for review.</p>
  if (!open) return <button className="linkbtn" onClick={() => setOpen(true)}>Report an error or a change in the rules</button>
  return (
    <form className="report stack" onSubmit={send}>
      <span className="eyebrow">Report about: {label}</span>
      <label className="field"><span>What is wrong or out of date?</span><textarea id={`rep-${kind}-${id}`} required minLength={5} maxLength={2000} rows={3} value={msg} onChange={e => setMsg(e.target.value)} /></label>
      <label className="field"><span>Link to the source, if you have one</span><input id={`rep-src-${kind}-${id}`} type="url" maxLength={500} placeholder="https://" value={src} onChange={e => setSrc(e.target.value)} /></label>
      <div className="row"><button className="btn primary" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send report'}</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
      {!supabase && <p className="muted" style={{ fontSize: '.8rem' }}>Reports need the app to be connected to Supabase. Until then, email donmaston09@gmail.com.</p>}
      {state === 'error' && <p className="err" role="alert">{err}</p>}
    </form>
  )
}

const KIND_LABEL: Record<RegUpdate['kind'], string> = { law: 'Law', guidance: 'Guidance', enforcement: 'Enforcement', deadline: 'Deadline', app: 'RegLife' }

function UpdateCard({ u, onOpen }: { u: RegUpdate; onOpen: (id: string) => void }) {
  return (
    <article className="card stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="eyebrow">{fmtDate(u.date)}</span>
        <span className="row"><Pill l="ac">{u.jurisdiction}</Pill><Pill>{KIND_LABEL[u.kind]}</Pill></span>
      </div>
      <h3>{u.title}</h3>
      <p style={{ fontSize: '.88rem' }}>{u.summary}</p>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row">{u.affects.filter(a => BY_ID[a]).map(a => <button key={a} className="btn ghost" style={{ padding: '3px 10px', fontSize: '.8rem' }} onClick={() => onOpen(a)}>{BY_ID[a].name}</button>)}</span>
        {u.source && <a href={u.source} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.84rem' }}>Source</a>}
      </div>
      <ReviewBadge kind="update" id={u.id} />
    </article>
  )
}

export function UpdatesView({ onOpen }: { onOpen: (id: string) => void }) {
  const next = comingUp(), past = recentUpdates()
  return (
    <section className="panel">
      <p className="lead">What has changed in the rules, and what is coming. Each entry links to its source and to the parts of the city it affects. Spotted something missing? Use "Report an error or a change in the rules".</p>
      {next.length > 0 && <div className="stack"><span className="eyebrow">Coming up</span><div className="grid g2">{next.map(u => <UpdateCard key={u.id} u={u} onOpen={onOpen} />)}</div></div>}
      <div className="stack"><span className="eyebrow">Recent changes</span><div className="grid g2">{past.map(u => <UpdateCard key={u.id} u={u} onOpen={onOpen} />)}</div></div>
      <div className="card stack"><span className="eyebrow">Tell us about a change</span><ReportButton kind="update" id="new" label="a new or changed rule" /></div>
      <Disclaimer />
    </section>
  )
}
