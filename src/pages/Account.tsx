import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { progressStore, useProgress } from '../lib/progress'
import { joinCohort, leaveCohort, myMemberships } from '../lib/cohorts'
import { BUILDINGS } from '../content/city'
import { SCENARIOS } from '../content/scenarios'
import Shell, { NeedsBackend } from './Shell'

export default function Account() {
  const { session, profile, refreshProfile, loading } = useAuth()
  const p = useProgress()
  const [name, setName] = useState(''); const [org, setOrg] = useState(''); const [saved, setSaved] = useState('')
  const [code, setCode] = useState(''); const [joinMsg, setJoinMsg] = useState(''); const [joinErr, setJoinErr] = useState('')
  const [confirmDel, setConfirmDel] = useState(''); const [delErr, setDelErr] = useState('')
  const [mem, setMem] = useState<{ cohort_id: string; cohorts: { name: string } | null }[]>([])
  useEffect(() => { if (profile) { setName(profile.display_name); setOrg(profile.organisation) } }, [profile])
  const uid = session?.user.id
  useEffect(() => { if (uid) myMemberships(uid).then(setMem).catch(() => {}) }, [uid])
  if (!supabase) return <Shell eyebrow="Account" title="Your account"><NeedsBackend /></Shell>
  if (loading) return null
  if (!session) return <Navigate to="/login?next=/account" replace />

  async function save(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase!.from('profiles').update({ display_name: name.trim(), organisation: org.trim() }).eq('id', uid!)
    setSaved(error ? error.message : 'Saved'); await refreshProfile()
  }
  async function join(e: FormEvent) {
    e.preventDefault(); setJoinErr(''); setJoinMsg('')
    try { const c = await joinCohort(code); setJoinMsg(`You joined ${c.name}.`); setCode(''); setMem(await myMemberships(uid!)) } catch (er) { setJoinErr((er as Error).message) }
  }
  async function download() {
    const [{ data: prof }, { data: prog }, { data: runs }] = await Promise.all([
      supabase!.from('profiles').select('*').eq('id', uid!).maybeSingle(),
      supabase!.from('progress').select('*').eq('user_id', uid!).maybeSingle(),
      supabase!.from('scenario_runs').select('*').eq('user_id', uid!)
    ])
    const data = { exported_at: new Date().toISOString(), email: session!.user.email, profile: prof, progress: prog, scenario_runs: runs, cohort_memberships: mem }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'reglife-my-data.json'; a.click(); URL.revokeObjectURL(a.href)
  }
  async function erase() {
    setDelErr('')
    const { error } = await supabase!.rpc('delete_my_account')
    if (error) { setDelErr(error.message); return }
    progressStore.reset(); await supabase!.auth.signOut(); location.assign('/')
  }
  const visited = p.visited.filter(v => BUILDINGS.some(b => b.id === v)).length
  return (
    <Shell eyebrow="Account" title={profile?.display_name ? `Hello, ${profile.display_name}` : 'Your account'}>
      <div className="kpis">
        <div className="kpi"><b>{visited}/{BUILDINGS.length}</b><span>Buildings visited</span></div>
        <div className="kpi"><b>{new Set(p.runs.map(r => r.scenario_id)).size}/{SCENARIOS.length}</b><span>Scenarios completed</span></div>
        <div className="kpi"><b>{p.runs.length ? Math.max(...p.runs.map(r => r.score)) : '–'}</b><span>Best score</span></div>
      </div>
      <div className="grid g2">
        <form className="card stack" onSubmit={save}><h3>Profile</h3>
          <p className="muted" style={{ fontSize: '.86rem' }}>Your educator sees this name in cohort reports.</p>
          <label className="field"><span>Display name</span><input id="dn" value={name} maxLength={80} onChange={e => setName(e.target.value)} /></label>
          <label className="field"><span>Organisation or course</span><input id="org" value={org} maxLength={120} onChange={e => setOrg(e.target.value)} /></label>
          <div className="row"><button className="btn primary" type="submit">Save profile</button><span className="ok">{saved}</span></div>
        </form>
        <div className="card stack"><h3>Cohorts</h3>
          <form className="row" onSubmit={join}><label className="field" style={{ flex: 1 }}><span>Join code</span><input id="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. K7PQ2M" maxLength={6} /></label><button className="btn primary" type="submit" style={{ alignSelf: 'end' }}>Join</button></form>
          {joinMsg && <p className="ok">{joinMsg}</p>}{joinErr && <p className="err">{joinErr}</p>}
          {mem.length ? <ul className="tight">{mem.map(m => <li key={m.cohort_id}>{m.cohorts?.name ?? 'Cohort'} <button className="btn ghost" style={{ padding: '2px 10px' }} onClick={async () => { await leaveCohort(m.cohort_id, uid!); setMem(await myMemberships(uid!)) }}>Leave</button></li>)}</ul> : <p className="muted" style={{ fontSize: '.86rem' }}>You are not in any cohort yet.</p>}
          <p className="muted" style={{ fontSize: '.8rem' }}>Your educator can see your name, organisation, buildings visited and scenario results from the date you joined.</p>
        </div>
      </div>
      <div className="card stack"><h3>Your data</h3>
        <p className="muted" style={{ fontSize: '.86rem' }}>We store your email, display name, organisation, buildings visited, classifier answers, planned changes and scenario results. You can download it or delete your account at any time.</p>
        <div className="row"><button className="btn" onClick={download}>Download my data</button></div>
        <label className="field" style={{ maxWidth: 360 }}><span>To delete your account and all your data, type DELETE</span><input id="confirm-delete" value={confirmDel} onChange={e => setConfirmDel(e.target.value)} /></label>
        <div className="row"><button className="btn" disabled={confirmDel !== 'DELETE'} onClick={erase}>Delete my account</button><span className="muted" style={{ fontSize: '.8rem' }}>This cannot be undone. Cohorts you own are deleted too.</span></div>
        {delErr && <p className="err" role="alert">{delErr}</p>}
      </div>
      <div className="card stack"><h3>Scenario history</h3>
        {p.runs.length ? <div className="tbl-wrap"><table><thead><tr><th>Date</th><th>Product</th><th>Score</th><th>Safety</th><th>Compliance</th><th>Trust</th></tr></thead><tbody>
          {[...p.runs].reverse().map(r => <tr key={r.completed_at}><td>{new Date(r.completed_at).toLocaleDateString('en-GB')}</td><td>{SCENARIOS.find(s => s.id === r.scenario_id)?.product ?? r.scenario_id}</td><td><b>{r.score}</b></td><td>{r.stats.safety}</td><td>{r.stats.comp}</td><td>{r.stats.trust}</td></tr>)}
        </tbody></table></div> : <p className="muted">Play a scenario from the city to see results here.</p>}
      </div>
    </Shell>
  )
}
