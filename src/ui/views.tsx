// Drawer views. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useMemo, useState, type ReactNode } from 'react'
import { classify } from '../lib/classify'
import { progressStore, useProgress } from '../lib/progress'
import { QUESTIONS } from '../content/questions'
import { CHANGES, ROLES } from '../content/changes'
import { RISKS } from '../content/risks'
import { CADENCE, CLOCKS } from '../content/monitoring'
import { PEOPLE, RACI, RACI_COLS, RACI_HEAD } from '../content/people'
import { FRAMEWORKS } from '../content/frameworks'
import { REGULATORS } from '../content/regulators'
import { BUILDINGS } from '../content/city'
import { SCENARIOS } from '../content/scenarios'
import type { District, Framework } from '../content/types'
import { ReportButton, ReviewBadge } from './review'

export const Pill = ({ l = '', children }: { l?: string; children: ReactNode }) => <span className={`pill ${l}`}>{children}</span>
export const Disclaimer = () => (
  <p className="disc">Educational tool, not legal advice. Indicative only, based on public rules and guidance as of mid-2026. Several timelines (the EU AI Act Digital Omnibus changes, MHRA reforms) were still moving. Confirm with qualified advisers. All products are fictional. Created by Anthony Onoja, Ph.D., School of Health Sciences, University of Surrey.</p>
)
const LVL: Record<number, [string, string]> = { 3: ['hi', 'New assessment likely'], 2: ['mid', 'Assess and document'], 1: ['lo', 'Document only'] }
export const KC: Record<District, string> = { own: 'var(--c-own)', uk: 'var(--c-uk)', eu: 'var(--c-eu)', us: 'var(--c-us)', care: 'var(--c-care)' }

type Open = (id: string) => void

export function ClassifyView({ onOpen }: { onOpen: Open }) {
  const { answers } = useProgress()
  const c = classify(answers)
  const ORDER = ['UK MHRA', 'NHS assurance', 'Data protection', 'EU MDR', 'EU AI Act', 'US FDA (comparison)']
  c.out.sort((a, b) => ORDER.indexOf(a.j) - ORDER.indexOf(b.j))
  return (
    <section className="panel">
      <p className="lead">The legal line is drawn by <b>intended purpose</b>: what you claim, to whom, and what the software does with data. Answers start with TriageMate. Change them to test your own product.</p>
      <div className="card stack" aria-live="polite"><span className="eyebrow">Indicative result</span>
        {c.out.map(o => <div key={o.j} className={`verdict ${o.l}`}><b>{o.j}</b><span>{o.v}</span></div>)}
        {c.notes.length > 0 && <ul className="tight">{c.notes.map(n => <li key={n}>{n}</li>)}</ul>}
      </div>
      <div className="card">
        {QUESTIONS.map(q => (
          <div className="q" key={q.id}><p>{q.p}</p>{q.h && <small>{q.h}</small>}
            <div className="seg" role="group" aria-label={q.p}>
              <button aria-pressed={answers[q.id]} onClick={() => progressStore.setAnswer(q.id, true)}>Yes</button>
              <button aria-pressed={!answers[q.id]} onClick={() => progressStore.setAnswer(q.id, false)}>No</button>
            </div>
          </div>))}
      </div>
      <div className="card stack"><span className="eyebrow">Where the boundary usually moves</span>
        <ul className="tight"><li>A new claim on the website, app store or in a sales demo</li><li>A clinician tool opened to patients</li><li>Analysing images or physiological signals</li><li>Taking away the human check</li><li>A hospital using it for a new purpose</li></ul>
        <div className="row"><button className="btn primary" onClick={() => onOpen('lab')}>Check a specific change</button></div>
      </div>
      <Disclaimer />
    </section>
  )
}

export function ChangeView({ onDocs }: { onDocs: () => void }) {
  const { changes } = useProgress()
  const sel = CHANGES.filter(c => changes.includes(c.id))
  const max = sel.reduce((m, c) => Math.max(m, c.lvl), 0)
  const people = [...new Set(sel.flatMap(c => c.who))]
  const groups = [...new Set(CHANGES.map(c => c.g))]
  return (
    <section className="panel">
      <p className="lead">Tick each change you plan. Every regime asks the same question: does it change the intended purpose, or could it significantly affect safety or performance? If yes, you need a new or updated assessment before release.</p>
      <div className="card stack" aria-live="polite"><span className="eyebrow">Verdict</span>
        {max ? <div className={`verdict ${LVL[max][0]}`}><b>{LVL[max][1]}</b><span className="muted">{sel.length} change{sel.length > 1 ? 's' : ''} selected. The highest impact sets the path.</span></div> : <p className="muted">Select one or more changes below.</p>}
        {people.length > 0 && <div className="row"><span className="eyebrow">Involve</span>{people.map(p => <Pill key={p} l="ac">{ROLES[p]}</Pill>)}</div>}
        {sel.length > 0 && <div className="row"><button className="btn primary" onClick={onDocs}>Write this up as a change impact log</button></div>}
      </div>
      {groups.map(g => (
        <div className="stack" key={g}><span className="eyebrow">{g}</span>
          {CHANGES.filter(c => c.g === g).map(c => (
            <label className="chk" key={c.id}><input type="checkbox" checked={changes.includes(c.id)} onChange={e => progressStore.toggleChange(c.id, e.target.checked)} />
              <span>{c.n} <Pill l={LVL[c.lvl][0]}>{LVL[c.lvl][1]}</Pill></span></label>))}
        </div>))}
      {sel.length > 0 && <div className="tbl-wrap wide"><table><thead><tr><th>Change</th><th>EU MDR</th><th>UK</th><th>US FDA</th><th>EU AI Act</th><th>Data protection</th></tr></thead>
        <tbody>{sel.map(c => <tr key={c.id}><td><b>{c.n}</b></td><td>{c.eu}</td><td>{c.uk}</td><td>{c.us}</td><td>{c.ai}</td><td>{c.data}</td></tr>)}</tbody></table></div>}
      <div className="card stack"><span className="eyebrow">Steps for any change</span>
        <ol className="tight"><li>Log it in change control (ISO 13485, IEC 62304)</li><li>Compare it with the intended purpose statement</li><li>Update the risk analysis and hazard log</li><li>Decide significance per regime and record why</li><li>Re-verify and re-validate, including subgroups</li><li>Notify or submit before release where required</li><li>Update instructions for use, model card and DPIA</li><li>Watch the change closely in post-market monitoring</li></ol></div>
      <Disclaimer />
    </section>
  )
}

const SCOPES: Record<string, string[]> = { model: ['Performance', 'Fairness', 'Transparency', 'Human factors', 'Agency'], soc: ['Security', 'Privacy', 'Supply chain'] }
export function RiskView({ scope, onOpen }: { scope: 'model' | 'soc'; onOpen: Open }) {
  const [f, setF] = useState('All')
  const pool = RISKS.filter(r => SCOPES[scope].includes(r.c))
  const cats = ['All', ...new Set(pool.map(r => r.c))]
  const list = pool.filter(r => f === 'All' || r.c === f)
  const other = scope === 'model' ? ['soc', 'Security Ops Centre'] : ['model', 'Model Lab']
  return (
    <section className="panel">
      <p className="lead">Each risk links to the legal duty it engages, the controls regulators expect to see, and what to monitor.</p>
      <div className="filters">{cats.map(c => <button key={c} aria-pressed={f === c} onClick={() => setF(c)}>{c}</button>)}</div>
      <div className="grid g2">{list.map(r => (
        <article className="card risk stack" key={r.n}>
          <header><div><span className="eyebrow">{r.c}</span><h3>{r.n}</h3></div><Pill l={r.s}>{r.s === 'hi' ? 'High' : 'Medium'}</Pill></header>
          <p style={{ fontSize: '.88rem' }}>{r.d}</p>
          <dl><div><dt>Example</dt><dd>{r.ex}</dd></div><div><dt>Legal hooks</dt><dd><ul className="tight">{r.law.map(x => <li key={x}>{x}</li>)}</ul></dd></div></dl>
          <details><summary>Controls and monitoring</summary><dl style={{ marginTop: 8 }}>
            <div><dt>Controls</dt><dd><ul className="tight">{r.ctl.map(x => <li key={x}>{x}</li>)}</ul></dd></div>
            <div><dt>Monitor</dt><dd><ul className="tight">{r.mon.map(x => <li key={x}>{x}</li>)}</ul></dd></div></dl></details>
          <ReviewBadge kind="risk" id={r.n} /><ReportButton kind="risk" id={r.n} label={r.n} />
        </article>))}</div>
      <div className="row"><button className="btn" onClick={() => onOpen(other[0])}>More risks at the {other[1]}</button></div>
      <Disclaimer />
    </section>
  )
}

function Spark({ vals, thr }: { vals: number[]; thr: number }) {
  const Wd = 300, H = 70, p = 6, mn = 80, mx = 96
  const x = (i: number) => p + i * (Wd - 2 * p) / (vals.length - 1), y = (v: number) => H - p - (v - mn) / (mx - mn) * (H - 2 * p)
  const ps = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '); const L = vals.length - 1
  return (
    <svg className="spark" viewBox={`0 0 ${Wd} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Sensitivity over 12 months, last value ${vals[L]}%`}>
      <line x1={p} x2={Wd - p} y1={y(thr)} y2={y(thr)} stroke="var(--hi)" strokeDasharray="4 4" />
      <polygon points={`${p},${H - p} ${ps} ${x(L)},${H - p}`} fill="var(--green-soft)" />
      <polyline points={ps} fill="none" stroke="var(--green)" strokeWidth="2" />
      <circle cx={x(L)} cy={y(vals[L])} r="4" fill="var(--hi)" />
    </svg>
  )
}
export function MonitorView() {
  const sens = [93.1, 93.4, 92.8, 93.0, 92.6, 92.9, 92.1, 91.5, 90.8, 89.9, 88.7, 87.9]
  return (
    <section className="panel">
      <p className="lead">Post-market surveillance is a legal duty under EU MDR, the UK PMS rules and the AI Act, and FDA expects it for AI devices. Watch performance, safety signals, security and changes in how people use the tool.</p>
      <div className="card stack"><div className="row" style={{ justifyContent: 'space-between' }}><span className="eyebrow">Example signal · emergency-case sensitivity</span><Pill l="hi">Below threshold</Pill></div>
        <Spark vals={sens} thr={90} />
        <div className="row mono muted" style={{ justifyContent: 'space-between' }}><span>Oct 2025</span><span>threshold 90%</span><span>Sep 2026: 87.9%</span></div>
        <p style={{ fontSize: '.88rem' }}>Below the 90% threshold for 3 months, starting when two sites changed symptom-coding systems. Open a CAPA, review root cause by site, and assess MDR Art 88 trend reporting.</p></div>
      <div className="card"><span className="eyebrow">Incident reporting clocks</span>
        {CLOCKS.map(c => <div className="clock" key={c.n}><span className="t">{c.t}</span><div><b>{c.n}</b> <Pill>{c.j}</Pill><small>{c.d}</small></div></div>)}</div>
      <div className="tbl-wrap"><table><thead><tr><th>Cadence</th><th>What to review</th><th>Owner</th></tr></thead><tbody>{CADENCE.map(r => <tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
      <div className="grid g3">
        <div className="card stack"><span className="eyebrow">Re-assess when</span><ul className="tight"><li>A metric crosses its threshold</li><li>A subgroup gap appears</li><li>A vendor model or data source changes</li><li>A new user group or use pattern shows up</li><li>Regulation or guidance changes</li></ul></div>
        <div className="card stack"><span className="eyebrow">Evidence to keep</span><ul className="tight"><li>Automatic logs (AI Act Art 12)</li><li>Model and prompt version per output</li><li>Complaints and CAPA records</li><li>PMS plan, reports and PSUR</li><li>Change significance decisions</li></ul></div>
        <div className="card stack"><span className="eyebrow">Signal sources</span><ul className="tight"><li>Complaints and feedback buttons</li><li>Clinician overrides</li><li>Outcome linkage with care records</li><li>Security monitoring</li><li>Literature and similar-device incidents</li></ul></div>
      </div>
      <Disclaimer />
    </section>
  )
}

export function PeopleView() {
  return (
    <section className="panel">
      <p className="lead">No single team can judge a regulatory boundary alone. R = responsible, A = accountable, C = consulted, I = informed.</p>
      <div className="tbl-wrap wide"><table><thead><tr><th>Activity</th>{RACI_COLS.map(c => <th key={c} className="rc">{RACI_HEAD[c]}</th>)}</tr></thead>
        <tbody>{RACI.map(r => <tr key={r[0]}><td>{r[0]}</td>{r.slice(1).map((v, i) => <td key={i} className={`rc ${v}`}>{v}</td>)}</tr>)}</tbody></table></div>
      <div className="grid g2">{PEOPLE.map(p => <div className="card stack" key={p[0]}><h3>{p[0]}</h3><p className="muted" style={{ fontSize: '.87rem' }}>{p[1]}</p></div>)}</div>
      <Disclaimer />
    </section>
  )
}

export const FrameworkCards = ({ list }: { list: Framework[] }) => list.length ? <>{list.map(f => (
  <article className="card stack" key={f.n}>
    <div className="row" style={{ justifyContent: 'space-between' }}><h3>{f.n}</h3><div className="row"><Pill l="ac">{f.j}</Pill><Pill>{f.t}</Pill></div></div>
    <p style={{ fontSize: '.88rem' }}>{f.k}</p>
    <p className="muted" style={{ fontSize: '.8rem' }}><b>Applies when:</b> {f.w}</p>
    <div className="row" style={{ justifyContent: 'space-between' }}><a href={f.u} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.84rem' }}>Source</a><ReviewBadge kind="framework" id={f.n} /></div>
    <ReportButton kind="framework" id={f.n} label={f.n} />
  </article>))}</> : <p className="muted">No frameworks match. Try a broader word.</p>

export function LibraryView() {
  const [j, setJ] = useState('UK'); const [q, setQ] = useState('')
  const list = useMemo(() => FRAMEWORKS.filter(f => (j === 'All' || f.j === j) && (!q || (f.n + f.k + f.w).toLowerCase().includes(q.toLowerCase()))), [j, q])
  return (
    <section className="panel">
      <p className="lead">{FRAMEWORKS.length} laws, guidance documents and standards that commonly apply to digital health AI, as of mid-2026. Check the source before relying on dates.</p>
      <input type="search" aria-label="Search frameworks" placeholder="Search, e.g. change, bias, breach" value={q} onChange={e => setQ(e.target.value)} />
      <div className="filters">{['All', 'EU', 'UK', 'US', 'Intl'].map(x => <button key={x} aria-pressed={j === x} onClick={() => setJ(x)}>{x === 'Intl' ? 'Standards' : x}</button>)}</div>
      <div className="grid g2"><FrameworkCards list={list} /></div>
      <Disclaimer />
    </section>
  )
}

export function RegulatorView({ id }: { id: string }) {
  const r = REGULATORS[id]
  const fws = FRAMEWORKS.filter(f => r.fw.includes(f.n))
  const clocks = CLOCKS.filter(c => r.clk.includes(c.j))
  return (
    <section className="panel">
      <p className="lead">{r.role}</p>
      <div className="row" style={{ justifyContent: 'space-between' }}><ReviewBadge kind="regulator" id={id} /><ReportButton kind="regulator" id={id} label="this regulator profile" /></div>
      <div className="card stack"><span className="eyebrow">When you deal with them</span><ul className="tight">{r.meet.map(m => <li key={m}>{m}</li>)}</ul></div>
      {clocks.length > 0 && <div className="card"><span className="eyebrow">Deadlines</span>{clocks.map(c => <div className="clock" key={c.n}><span className="t">{c.t}</span><div><b>{c.n}</b><small>{c.d}</small></div></div>)}</div>}
      <div className="stack"><span className="eyebrow">Rules they apply</span><div className="grid g2"><FrameworkCards list={fws} /></div></div>
      <Disclaimer />
    </section>
  )
}

export function DirectoryView({ onOpen }: { onOpen: Open }) {
  const { visited } = useProgress()
  const groups: [District, string][] = [['own', 'Your campus'], ['uk', 'UK Borough'], ['eu', 'EU Quarter'], ['us', 'US Bay'], ['care', 'Care District']]
  return (
    <section className="panel">
      <p className="lead">Every building in the city. You have visited {visited.filter(v => BUILDINGS.some(b => b.id === v)).length} of {BUILDINGS.length}.</p>
      {groups.map(([k, n]) => (
        <div className="stack" key={k}><span className="eyebrow">{n}</span>
          <div className="dir">{BUILDINGS.filter(b => b.k === k).map(b => (
            <button key={b.id} onClick={() => onOpen(b.id)}><span className="ic" style={{ background: KC[b.k] }}>{b.code}</span>
              <span><b>{b.name}</b><small>{b.sub.split(' · ')[1]}{visited.includes(b.id) ? ' · visited' : ''}</small></span></button>))}</div>
        </div>))}
      <Disclaimer />
    </section>
  )
}

export function AboutView() {
  const [msg, setMsg] = useState('')
  const copy = async () => { try { await navigator.clipboard.writeText('donmaston09@gmail.com'); setMsg('Copied') } catch { setMsg('Select the address to copy it') } }
  return (
    <section className="panel">
      <div className="card stack"><span className="eyebrow">Creator</span><h2>Anthony Onoja, Ph.D.</h2><p>School of Health Sciences<br />University of Surrey, United Kingdom</p>
        <div className="copyrow"><code>donmaston09@gmail.com</code><button className="btn" onClick={copy}>Copy email</button><span className="muted" aria-live="polite">{msg}</span></div></div>
      <div className="card stack"><span className="eyebrow">About RegLife</span>
        <p>RegLife is a teaching and self-assessment tool on the regulation of digital health AI. It shows where the legal boundaries sit, how a change in the use of a product can change its regulatory status, how to monitor a live tool, who needs to be involved, and how risks such as cyber attacks, prompt injection, hallucination, bias and black-box decisions link to legal duties.</p>
        <p className="muted">The city format is inspired by Lagos Life. Coverage: UK, EU and US, plus international standards.</p></div>
      <Disclaimer />
    </section>
  )
}

export function ScenarioPicker({ onPick }: { onPick: (id: string) => void }) {
  const { runs } = useProgress()
  return (
    <section className="panel">
      <p className="lead">Pick a scenario and run it through a year of dilemmas. The NHS trust casebook is built from real public cases. Each choice moves five stats. Your best score is saved{runs.length ? '' : ' when you finish'}.</p>
      <div className="grid g2">{SCENARIOS.map(s => {
        const best = Math.max(-1, ...runs.filter(r => r.scenario_id === s.id).map(r => r.score))
        return (
          <button className="scen" key={s.id} onClick={() => onPick(s.id)}>
            <span className="eyebrow">{s.events.length} quarters</span><h3>{s.product}: {s.title}</h3>
            <span className="muted" style={{ fontSize: '.86rem' }}>{s.blurb}</span>
            <ReviewBadge kind="scenario" id={s.id} />
            <span className="row"><Pill l={s.perspective === 'deployer' ? 'lo' : ''}>{s.perspective === 'deployer' ? 'You deploy it' : 'You build it'}</Pill>{s.tags.map(t => <Pill key={t}>{t}</Pill>)}{best >= 0 && <Pill l="lo">Best {best}</Pill>}</span>
          </button>)
      })}</div>
      <Disclaimer />
    </section>
  )
}
