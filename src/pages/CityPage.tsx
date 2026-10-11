// Main city screen. Created by Anthony Onoja, Ph.D., University of Surrey.
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BY_ID } from '../content/city'
import { REGULATORS } from '../content/regulators'
import { SCENARIO_BY_ID, SCENARIOS } from '../content/scenarios'
import type { Choice, Stats } from '../content/types'
import { applyChoice, finalScore, grade, isBusted, START_STATS, STATS } from '../lib/scoring'
import { progressStore } from '../lib/progress'
import { useAuth } from '../lib/auth'
import { hasBackend } from '../lib/supabase'
import { City2D, GLBoundary, hasWebGL } from '../ui/Fallback'
import { WorkDocsView, type DocPreset } from '../ui/workdocs'
import { ReportButton, UpdatesView } from '../ui/review'
import { tickerLines } from '../content/updates'
import { DrillsView, TrustView } from '../ui/drills'
import { AboutView, ChangeView, ClassifyView, DirectoryView, Disclaimer, KC, LibraryView, MonitorView, PeopleView, Pill, RegulatorView, RiskView, ScenarioPicker } from '../ui/views'

const City = lazy(() => import('../three/City'))

interface Sim { id: string; i: number; s: Stats; pending: Choice | null; choices: number[]; over: boolean }
const NEWS = tickerLines()

function Meters({ s }: { s: Stats }) {
  return <>{STATS.map(([k, l]) => { const v = s[k]; const c = v < 30 ? 'hi' : v < 55 ? 'mid' : ''; return (
    <div className="mrow" key={k}><span>{l}</span><div className="meter" role="meter" aria-label={l} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}><i className={c} style={{ width: `${v}%` }} /></div><span className="num">{v}</span></div>) })}</>
}

export default function CityPage() {
  const { session, profile } = useAuth()
  const [open, setOpen] = useState<string | null>(null)
  const [sim, setSim] = useState<Sim | null>(null)
  const [ni, setNi] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [preset, setPreset] = useState<DocPreset>({ type: 'change' })
  const openDocs = (p: DocPreset) => { setPreset(p); setOpen('docs') }
  const [gl] = useState(() => hasWebGL())
  const [mode, setMode] = useState<'3d' | '2d'>(() => { try { return (localStorage.getItem('reglife.mode') as '3d' | '2d') || '3d' } catch { return '3d' } })
  const use2d = !gl || mode === '2d'
  const switchMode = () => { const m = mode === '3d' ? '2d' : '3d'; setMode(m); try { localStorage.setItem('reglife.mode', m) } catch { /* ignore */ } }

  useEffect(() => { document.body.classList.add('city'); return () => document.body.classList.remove('city') }, [])
  useEffect(() => { const h = location.hash.slice(1); if (h && (BY_ID[h] || ['directory', 'about', 'play', 'docs', 'updates'].includes(h))) setOpen(h) }, [])
  useEffect(() => { try { history.replaceState(null, '', open ? '#' + open : location.pathname) } catch { /* ignore */ } if (open && BY_ID[open]) progressStore.visit(open); bodyRef.current?.scrollTo(0, 0) }, [open])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setNi(n => (n + 1) % NEWS.length), 5000); return () => clearInterval(t)
  }, [])
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])

  const scen = sim ? SCENARIO_BY_ID[sim.id] : null
  const ev = scen && sim && !sim.over ? scen.events[sim.i] : null
  const eventAt = ev ? ev.b : null

  function start(id: string) { const s: Sim = { id, i: 0, s: { ...START_STATS }, pending: null, choices: [], over: false }; setSim(s); setOpen(SCENARIO_BY_ID[id].events[0].b) }
  function choose(idx: number) {
    if (!sim || !ev) return
    const c = ev.o[idx]
    setSim({ ...sim, s: applyChoice(sim.s, c), pending: c, choices: [...sim.choices, idx] })
  }
  function next() {
    if (!sim || !scen) return
    if (isBusted(sim.s) || sim.i >= scen.events.length - 1) {
      setSim({ ...sim, pending: null, over: true }); setOpen('result')
      progressStore.addRun({ scenario_id: sim.id, score: finalScore(sim.s), stats: sim.s, choices: sim.choices, completed_at: new Date().toISOString() })
    } else { const i = sim.i + 1; setSim({ ...sim, i, pending: null }); setOpen(scen.events[i].b) }
  }

  let title = '', sub = '', code = '', col = 'var(--green)'
  let content: ReactNode = null
  const simHere = !!(ev && open === ev.b)
  if (open) {
    const b = BY_ID[open]
    if (b) { title = b.name; sub = b.sub; code = b.code; col = KC[b.k] }
    if (open === 'directory') { title = 'City directory'; sub = 'All buildings'; code = 'MAP' }
    if (open === 'about') { title = 'About RegLife'; sub = 'Creator and purpose'; code = 'i' }
    if (open === 'updates') { title = 'Regulatory updates'; sub = 'What has changed and what is coming'; code = 'NEW' }
    if (open === 'play') { title = 'Play your year'; sub = 'Choose a scenario'; code = 'GO' }
    if (open === 'result') { title = 'Your year in review'; sub = scen ? `${scen.product} · ${scen.title}` : ''; code = 'END' }
    if (simHere && ev && sim && scen) {
      sub = `${scen.product} · ${ev.q}`
      content = sim.pending ? (
        <section className="panel">
          <div className="card simstats"><Meters s={sim.s} /></div>
          <div className="card stack"><span className="eyebrow">{ev.q}</span><p>{ev.t}</p></div>
          <div className="outcome" aria-live="polite"><b>{sim.pending.l}</b><p>{sim.pending.r}</p>
            <div className="delta">{Object.entries(sim.pending.d).map(([k, v]) => <span key={k} className={v! > 0 ? 'up' : 'dn'}>{STATS.find(x => x[0] === k)![1]} {v! > 0 ? '+' : ''}{v} · </span>)}</div>
            <div className="lesson">{sim.pending.les}</div>
            {ev.basis && <div className="basis"><span className="eyebrow">Based on a real case</span><p>{ev.basis.text}</p><ReportButton kind="scenario" id={`${scen.id}:${sim.i}`} label={`${scen.product}, ${ev.q}`} /><a href={ev.basis.url} target="_blank" rel="noopener noreferrer">Read the source</a></div>}</div>
          <div className="row"><button className="btn primary" onClick={next}>{sim.i < scen.events.length - 1 && !isBusted(sim.s) ? 'Next quarter' : 'See the result'}</button></div>
        </section>
      ) : (
        <section className="panel">
          <div className="card simstats"><Meters s={sim.s} /></div>
          <div className="card stack"><span className="eyebrow">{ev.q} · {sim.i + 1} of {scen.events.length}</span><h3 style={{ fontSize: '1.1rem' }}>{ev.t}</h3></div>
          <div className="stack">{ev.o.map((o, i) => <button key={i} className="choice" onClick={() => choose(i)}>{o.l}</button>)}</div>
          <p className="muted" style={{ fontSize: '.8rem' }}>Choices move your five stats. If any hits zero the year ends early.</p>
        </section>)
    } else if (open === 'result' && sim && scen) {
      const score = finalScore(sim.s); const g = grade(score); const fail = STATS.find(([k]) => sim.s[k] <= 0)
      content = (
        <section className="panel">
          <div className="card stack"><h2>{fail ? `${fail[1]} hit zero.` : `${scen.product} made it through the year.`}</h2><span><Pill l={g[0]}>{g[1]}</Pill></span>
            <p>Score <b>{score}</b>, the average of safety, compliance and trust. {hasBackend && !session ? <><Link to="/login">Sign in</Link> to save it to your account.</> : 'Saved to your progress.'}</p></div>
          <div className="stack"><span className="eyebrow">What you learned</span>
            {scen.events.slice(0, sim.choices.length).map((e, i) => <div className="lesson" key={i}><b className="mono">{e.q}</b> {e.o[sim.choices[i]].les}</div>)}</div>
          <div className="card stack"><span className="eyebrow">Take it back to work</span><p>Turn what you just practised into a document you can use: {scen.doc === 'change' ? 'a change impact log entry' : scen.doc === 'hazard' ? 'a hazard log line' : 'a list of questions for your supplier'}.</p>
            <div className="row"><button className="btn primary" onClick={() => openDocs({ type: scen.doc, kind: scen.kind, product: scen.product })}>Create the document</button></div></div>
          <div className="row"><button className="btn" onClick={() => start(sim.id)}>Play again</button><button className="btn" onClick={() => setOpen('play')}>Try another product</button><button className="btn" onClick={() => { setSim(null); setOpen(null) }}>Back to the city</button></div>
          <Disclaimer />
        </section>)
    } else {
      const map: Record<string, ReactNode> = {
        hq: <ClassifyView onOpen={setOpen} />, lab: <ChangeView onDocs={() => openDocs({ type: 'change' })} />, tower: <MonitorView />, board: <PeopleView />, library: <LibraryView />,
        model: <RiskView key="model" scope="model" onOpen={setOpen} />, soc: <RiskView key="soc" scope="soc" onOpen={setOpen} />,
        directory: <DirectoryView onOpen={setOpen} />, about: <AboutView />, play: <ScenarioPicker onPick={start} />,
        docs: <WorkDocsView key={preset.type + (preset.product ?? '')} preset={preset} />, updates: <UpdatesView onOpen={setOpen} />, drills: <DrillsView onDocs={() => openDocs({ type: 'change' })} />, trust: <TrustView onOpen={id => id === 'docs' ? openDocs({ type: 'vendor' }) : setOpen(id)} />
      }
      content = map[open] ?? (REGULATORS[open] ? <RegulatorView id={open} /> : null)
      if (ev && !['directory', 'about', 'play', 'updates'].includes(open)) content = <>
        <div className="card row" style={{ justifyContent: 'space-between', marginBottom: 14 }}><span>Your next event is at the <b>{BY_ID[ev.b].name}</b>.</span><button className="btn primary" onClick={() => setOpen(ev.b)}>Go there</button></div>{content}</>
    }
  }

  const playLabel = !sim ? 'Play your year' : sim.over ? 'See your result' : `Continue · ${ev?.q.split(' · ')[0]}`
  const onPlay = () => { if (!sim) setOpen('play'); else if (sim.over) setOpen('result'); else if (ev) setOpen(ev.b) }

  return (
    <>
      <div className="stage">
        {use2d ? <City2D active={open} eventAt={eventAt} onOpen={setOpen} note={gl ? undefined : 'This device cannot show the 3D city, so you are seeing the 2D map. Everything else works the same.'} /> : (
          <GLBoundary fallback={<City2D active={open} eventAt={eventAt} onOpen={setOpen} note="The 3D city could not start on this device, so you are seeing the 2D map." />}>
            <Suspense fallback={<div className="page" style={{ display: 'grid', placeItems: 'center' }}><p className="muted">Loading the city…</p></div>}>
              <City active={open && BY_ID[open] ? open : null} eventAt={eventAt} avatarAt={eventAt ?? (open && BY_ID[open] ? open : 'hq')} onOpen={setOpen} />
            </Suspense>
          </GLBoundary>)}
      </div>

      <div className="hud">
        <div className="bar">
          <div className="brand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M12 8v7M8.5 11.5h7" /></svg>RegLife</div>
          <div className="live"><span><span className="dot" /><b>{SCENARIOS.length}</b> scenarios</span><span className="v2">{Object.keys(BY_ID).length} buildings</span></div>
          <div className="sp">
            {hasBackend && (session ? <Link className="acct btn ghost" to="/account">{profile?.display_name || 'Account'}</Link> : <Link className="acct btn ghost" to="/login">Sign in</Link>)}
            {gl && <button className="btn ghost" onClick={switchMode} aria-label={mode === '3d' ? 'Switch to the 2D map' : 'Switch to the 3D city'}>{mode === '3d' ? '2D' : '3D'}</button>}
            <button className="btn ghost" onClick={() => setOpen('directory')}>Directory</button>
          </div>
        </div>
        <div className="chips">
          <button className="chip" onClick={() => setOpen('hq')}><i>PRODUCT</i>{scen?.product ?? 'TriageMate'}</button>
          <button className="chip" onClick={() => setOpen('about')}><i>BY</i>A. Onoja, Ph.D.</button>
          {session && <Link className="chip c3" to="/educator" style={{ textDecoration: 'none', color: 'inherit' }}><i>TEACH</i>Educator</Link>}
        </div>
        <button className="ticker" aria-live="polite" onClick={() => setOpen('updates')} title="See all regulatory updates">{NEWS[ni % NEWS.length]}</button>
      </div>

      {sim && !sim.over && <div className="needs"><Meters s={sim.s} /></div>}

      <div className="dock">
        <div className="who"><div className="faces"><span style={{ background: 'var(--c-own)' }}>RA</span><span style={{ background: 'var(--c-uk)' }}>CSO</span><span style={{ background: 'var(--c-us)' }}>ML</span><span style={{ background: 'var(--c-care)' }}>DPO</span></div>
          <span><b>Your team</b> · {use2d ? "tap a building" : "drag to explore, tap a building"}</span></div>
        <div className="acts"><button className="btn primary" onClick={onPlay}>{playLabel}</button><button className="btn" onClick={() => setOpen('hq')}>Classify it</button></div>
        <div className="credit">Created by <button onClick={() => setOpen('about')}>Anthony Onoja, Ph.D.</button> · University of Surrey</div>
        <div className="tools">{[['updates', 'Updates'], ['trust', 'Deployer office'], ['drills', 'Drills'], ['docs', 'Documents'], ['lab', 'Change check'], ['soc', 'Risks'], ['library', 'Frameworks']].map(([id, l]) => <button key={id} onClick={() => setOpen(id)}>{l}</button>)}</div>
      </div>

      {open && (
        <aside className="drawer" aria-labelledby="dtitle" role="dialog">
          <div className="dhead"><div className="ic" style={{ background: col }}>{code}</div><div style={{ minWidth: 0 }}><span className="eyebrow">{sub}</span><h2 id="dtitle">{title}</h2></div>
            <button className="x" aria-label="Close" onClick={() => setOpen(null)}>×</button></div>
          <div className="dbody" ref={bodyRef}>{content}</div>
        </aside>
      )}
    </>
  )
}
