// Educator dashboard. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { cohortReport, createCohort, deleteCohort, myCohorts, type Cohort, type ReportRow } from '../lib/cohorts'
import { BUILDINGS } from '../content/city'
import { SCENARIOS } from '../content/scenarios'
import { STATS, weakest } from '../lib/scoring'
import type { Stats } from '../content/types'
import Shell, { NeedsBackend } from './Shell'
import { csvCell } from '../lib/safety'

const STAT_NAME = Object.fromEntries(STATS) as Record<string, string>
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '–'

function Bars({ rows }: { rows: { label: string; value: number | null; n: number }[] }) {
  return (
    <div className="stack">
      {rows.map(r => (
        <div className="hbar" key={r.label} title={r.value == null ? `${r.label}: no results yet` : `${r.label}: ${r.value} average across ${r.n} run${r.n === 1 ? '' : 's'}`}>
          <span>{r.label}</span>
          <div className="meter" role="img" aria-label={r.value == null ? `${r.label}: no results` : `${r.label}: ${r.value} out of 100`}><i style={{ width: `${r.value ?? 0}%`, background: 'var(--green)' }} /></div>
          <span className="num">{r.value ?? '–'}</span>
        </div>))}
    </div>
  )
}

export default function Educator() {
  const { session, loading } = useAuth()
  const uid = session?.user.id
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [sel, setSel] = useState<string>('')
  const [rows, setRows] = useState<ReportRow[]>([])
  const [name, setName] = useState(''); const [err, setErr] = useState(''); const [copied, setCopied] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => { if (uid) myCohorts(uid).then(c => { setCohorts(c); if (c[0]) setSel(s => s || c[0].id) }).catch(e => setErr(e.message)) }, [uid])
  useEffect(() => { setConfirmDel(false); if (sel) cohortReport(sel).then(setRows).catch(e => setErr(e.message)); else setRows([]) }, [sel])

  const cohort = cohorts.find(c => c.id === sel)
  const stats = useMemo(() => {
    const runs = rows.flatMap(r => r.runs)
    const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null
    const byScen = SCENARIOS.map(s => { const rs = runs.filter(r => r.scenario_id === s.id); return { label: s.product, value: avg(rs.map(r => r.score)), n: rs.length } })
    const byStat = (['safety', 'comp', 'trust'] as const).map(k => ({ label: STAT_NAME[k], value: avg(runs.map(r => r.stats[k])), n: runs.length }))
    const active = rows.filter(r => r.updated_at && Date.now() - new Date(r.updated_at).getTime() < 7 * 864e5).length
    const exploring = avg(rows.map(r => Math.round(100 * r.visited.filter(v => BUILDINGS.some(b => b.id === v)).length / BUILDINGS.length)))
    const drillDone = rows.flatMap(r => Object.values(r.drills ?? {}))
    const drillPct = drillDone.length ? Math.round(100 * drillDone.filter(d => d.correct).length / drillDone.length) : null
    const docsN = rows.reduce((n, r) => n + (r.docs?.length ?? 0), 0)
    const certainWrong = drillDone.filter(d => d.conf === 2 && !d.correct).length
    return { runs, byScen, byStat, active, exploring, avgScore: avg(runs.map(r => r.score)), drillPct, docsN, certainWrong }
  }, [rows])

  if (!supabase) return <Shell eyebrow="Educator" title="Educator dashboard"><NeedsBackend /></Shell>
  if (loading) return null
  if (!session) return <Navigate to="/login?next=/educator" replace />

  async function add(e: FormEvent) {
    e.preventDefault(); setErr('')
    try { const c = await createCohort(name.trim(), uid!); setCohorts([c, ...cohorts]); setSel(c.id); setName('') } catch (er) { setErr((er as Error).message) }
  }
  const link = cohort ? `${location.origin}/join/${cohort.join_code}` : ''
  async function copyLink() { try { await navigator.clipboard.writeText(link); setCopied('Link copied') } catch { setCopied('Select the link to copy it') } }
  function exportCsv() {
    const head = ['Name', 'Organisation', 'Joined', 'Last active', 'Buildings visited', ...SCENARIOS.map(s => `${s.product} best`), 'Weakest area', 'Drills matched experts', 'Drills done', 'Documents made']
    const lines = rows.map(r => {
      const best = SCENARIOS.map(s => { const sc = r.runs.filter(x => x.scenario_id === s.id).map(x => x.score); return sc.length ? Math.max(...sc) : '' })
      const last = r.runs[r.runs.length - 1]
      return [r.display_name || 'Unnamed', r.organisation, r.joined_at.slice(0, 10), r.updated_at?.slice(0, 10) ?? '', r.visited.length, ...best, last ? STAT_NAME[weakest(last.stats as Stats)] : '', Object.values(r.drills ?? {}).filter(d => d.correct).length, Object.keys(r.drills ?? {}).length, r.docs?.length ?? 0]
    })
    const csv = [head, ...lines].map(l => l.map(csvCell).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${cohort?.name ?? 'cohort'}-reglife.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <Shell eyebrow="Educator" title="Educator dashboard">
      <div className="grid g2">
        <form className="card stack" onSubmit={add}><h3>Create a cohort</h3>
          <p className="muted" style={{ fontSize: '.86rem' }}>Learners join with a 6-character code or link. You see their progress from the day they join.</p>
          <label className="field"><span>Cohort name</span><input id="cname" required maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MSc Digital Health 2026/27" /></label>
          <button className="btn primary" type="submit">Create cohort</button>
          {err && <p className="err">{err}</p>}
        </form>
        <div className="card stack"><h3>Your cohorts</h3>
          {cohorts.length ? <div className="filters">{cohorts.map(c => <button key={c.id} aria-pressed={c.id === sel} onClick={() => setSel(c.id)}>{c.name}</button>)}</div> : <p className="muted">No cohorts yet.</p>}
          {cohort && <>
            <div className="copyrow"><code>{cohort.join_code}</code><code style={{ maxWidth: '100%', overflow: 'auto' }}>{link}</code></div>
            <div className="row"><button className="btn" onClick={copyLink}>Copy join link</button><button className="btn" onClick={exportCsv} disabled={!rows.length}>Export CSV</button>
              {!confirmDel ? <button className="btn ghost" onClick={() => setConfirmDel(true)}>Delete cohort</button>
                : <><span className="err">Delete {cohort.name} and its memberships?</span><button className="btn" onClick={async () => { await deleteCohort(cohort.id); const rest = cohorts.filter(c => c.id !== cohort.id); setCohorts(rest); setSel(rest[0]?.id ?? '') }}>Yes, delete</button><button className="btn ghost" onClick={() => setConfirmDel(false)}>Cancel</button></>}
              <span className="ok">{copied}</span></div>
          </>}
        </div>
      </div>

      {cohort && <>
        <div className="kpis">
          <div className="kpi"><b>{rows.length}</b><span>Learners</span></div>
          <div className="kpi"><b>{stats.active}</b><span>Active in the last 7 days</span></div>
          <div className="kpi"><b>{stats.exploring ?? '–'}{stats.exploring != null && '%'}</b><span>Average city explored</span></div>
          <div className="kpi"><b>{stats.runs.length}</b><span>Scenario runs</span></div>
          <div className="kpi"><b>{stats.drillPct ?? '–'}{stats.drillPct != null && '%'}</b><span>Drill answers matching experts</span></div>
          <div className="kpi"><b>{stats.certainWrong}</b><span>Drills answered 'certain' but differing</span></div>
          <div className="kpi"><b>{stats.docsN}</b><span>Work documents made</span></div>
          <div className="kpi"><b>{stats.avgScore ?? '–'}</b><span>Average score</span></div>
        </div>
        <div className="grid g2">
          <div className="card stack"><span className="eyebrow">Average score by scenario (0–100)</span><Bars rows={stats.byScen} /></div>
          <div className="card stack"><span className="eyebrow">Average end-of-year stat across runs (0–100)</span><Bars rows={stats.byStat} />
            <p className="muted" style={{ fontSize: '.8rem' }}>The lowest bar is the area to cover in your next session.</p></div>
        </div>
        <div className="card stack"><h3>Learners</h3>
          {rows.length ? <div className="tbl-wrap"><table><thead><tr><th>Name</th><th>Organisation</th><th>Joined</th><th>Last active</th><th>City</th>{SCENARIOS.map(s => <th key={s.id}>{s.product}</th>)}<th>Weakest</th><th>Drills</th><th>Docs</th></tr></thead><tbody>
            {rows.map(r => {
              const last = r.runs[r.runs.length - 1]
              return <tr key={r.user_id}><td><b>{r.display_name || 'Unnamed learner'}</b></td><td>{r.organisation}</td><td>{fmtDate(r.joined_at)}</td><td>{fmtDate(r.updated_at)}</td>
                <td className="num">{r.visited.filter(v => BUILDINGS.some(b => b.id === v)).length}/{BUILDINGS.length}</td>
                {SCENARIOS.map(s => { const sc = r.runs.filter(x => x.scenario_id === s.id).map(x => x.score); return <td key={s.id} className="num">{sc.length ? Math.max(...sc) : '–'}</td> })}
                <td>{last ? STAT_NAME[weakest(last.stats as Stats)] : '–'}</td>
                <td className="num">{Object.values(r.drills ?? {}).filter(d => d.correct).length}/{Object.keys(r.drills ?? {}).length}</td><td className="num">{r.docs?.length ?? 0}</td></tr>
            })}</tbody></table></div> : <p className="muted">Nobody has joined yet. Share the join link with your learners.</p>}
        </div>
      </>}
    </Shell>
  )
}
