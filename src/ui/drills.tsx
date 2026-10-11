// Drill Hall and Trust Digital Office. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useState } from 'react'
import { DRILLS, LEVELS } from '../content/drills'
import { progressStore, useProgress } from '../lib/progress'
import { Disclaimer, Pill } from './views'
import { ReportButton, ReviewBadge } from './review'

const CONF = ['A guess', 'Fairly sure', 'Certain']

export function DrillsView({ onDocs }: { onDocs: () => void }) {
  const { drills } = useProgress()
  const firstOpen = DRILLS.findIndex(d => !drills[d.id])
  const [i, setI] = useState(firstOpen < 0 ? 0 : firstOpen)
  const [choice, setChoice] = useState<number | null>(null)
  const [conf, setConf] = useState<number | null>(null)
  const d = DRILLS[i]
  const done = Object.keys(drills).filter(k => DRILLS.some(x => x.id === k))
  const correct = done.filter(k => drills[k].correct).length
  const res = drills[d.id]
  const revealed = !!res && choice === null
  const certainWrong = done.filter(k => drills[k].conf === 2 && !drills[k].correct).length
  const submit = () => { if (choice === null || conf === null) return; progressStore.drill(d.id, { choice, conf, correct: choice === d.answer, at: new Date().toISOString() }); setChoice(null); setConf(null) }
  const go = (n: number) => { setI((n + DRILLS.length) % DRILLS.length); setChoice(null); setConf(null) }
  return (
    <section className="panel">
      <p className="lead">Short real-world situations from the deployer’s side. Decide how big a response the change needs, say how sure you are, then compare with the expert reasoning.</p>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row"><Pill l="ac">{done.length} of {DRILLS.length} done</Pill>{done.length > 0 && <Pill l={correct / done.length >= 0.7 ? 'lo' : 'mid'}>{correct} matched the experts</Pill>}{certainWrong > 0 && <Pill l="hi">{certainWrong} certain but different</Pill>}</span>
        <span className="row"><button className="btn ghost" onClick={() => go(i - 1)}>Previous</button><button className="btn ghost" onClick={() => go(i + 1)}>Next</button></span>
      </div>
      <article className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}><span className="eyebrow">Drill {i + 1} · {d.nation} · {d.role}</span><ReviewBadge kind="drill" id={d.id} /></div>
        <h3 style={{ fontSize: '1.1rem' }}>{d.title}</h3>
        <p>{d.context}</p>
        <p><b>What changes:</b> {d.change}</p>
      </article>
      {!revealed ? (
        <div className="stack">
          <span className="eyebrow">What response does this need?</span>
          {LEVELS.map((l, k) => <button key={k} className="choice" aria-pressed={choice === k} style={choice === k ? { borderColor: 'var(--green)', background: 'var(--green-soft)' } : undefined} onClick={() => setChoice(k)}><b>{l.short}.</b> {l.long.replace(l.short + '. ', '')}</button>)}
          <span className="eyebrow">How sure are you?</span>
          <div className="seg" role="group" aria-label="How sure are you">{CONF.map((c, k) => <button key={c} aria-pressed={conf === k} onClick={() => setConf(k)}>{c}</button>)}</div>
          <div className="row"><button className="btn primary" disabled={choice === null || conf === null} onClick={submit}>See the expert view</button></div>
        </div>
      ) : (
        <div className="stack" aria-live="polite">
          <div className="outcome">
            <b>{res.correct ? 'You matched the expert view.' : 'The expert view differs.'} You chose: {LEVELS[res.choice].short} ({CONF[res.conf].toLowerCase()}).</b>
            <p><b>Expert view: {LEVELS[d.answer].short}.</b> {d.reasoning}</p>
            <div><span className="eyebrow">What to do</span><ul className="tight">{d.actions.map(a => <li key={a}>{a}</li>)}</ul></div>
            <div><span className="eyebrow">Read more</span><ul className="tight">{d.refs.map(r => <li key={r.url + r.text}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.text}</a></li>)}</ul></div>
            <ReportButton kind="drill" id={d.id} label={`the drill "${d.title}"`} />
          </div>
          <div className="row"><button className="btn primary" onClick={() => go(i + 1)}>Next drill</button><button className="btn" onClick={() => progressStore.clearDrill(d.id)}>Try this one again</button><button className="btn" onClick={onDocs}>Write it up as a change log</button></div>
        </div>
      )}
      {done.length > 0 && certainWrong > 0 && <p className="muted" style={{ fontSize: '.84rem' }}>Answers you were certain about but which differ from the expert view are the ones most worth discussing with colleagues.</p>}
      <Disclaimer />
    </section>
  )
}

const DUTIES: [string, string[]][] = [
  ['Before you buy', ['Confirm the regulatory status and intended purpose match your use (and CE or UKNI marking in Northern Ireland)', 'Get DTAC evidence, the supplier’s DCB0129 safety case and DSPT status', 'Ask for independent and subgroup evidence, not only the supplier’s figures', 'Start your DPIA and get Caldicott Guardian input']],
  ['Before go-live', ['Complete your own DCB0160 assessment and hazard log, signed by your clinical safety officer', 'Validate locally, ideally silently on your own data first', 'Train users, including on limitations and what to do when they disagree', 'Set up a tested fallback for downtime', 'Tell patients where AI is used, in the right languages (Welsh in NHS Wales)']],
  ['While it is live', ['Monitor performance, overrides and incidents, including by patient group', 'Assess every supplier update before it reaches users', 'Act on field safety notices straight away', 'Report adverse incidents (MHRA Yellow Card, IRIC in Scotland, NIAIC in Northern Ireland)', 'Review the DPIA and hazard log at least yearly']],
  ['If you change how you use it', ['Check the change is within the intended purpose and instructions for use', 'If not, stop and talk to the supplier: you may be taking on manufacturer duties', 'Record the decision in a change impact log']]
]

export function TrustView({ onOpen }: { onOpen: (id: string) => void }) {
  const [ticks, setTicks] = useState<Record<string, boolean>>({})
  const total = DUTIES.reduce((n, [, l]) => n + l.length, 0)
  const doneN = Object.values(ticks).filter(Boolean).length
  return (
    <section className="panel">
      <p className="lead">Most AI in the NHS is bought, not built. This office covers the duties of the organisation that deploys it: clinical safety, data protection, monitoring and change.</p>
      <div className="grid g3">
        <button className="scen" onClick={() => onOpen('drills')}><span className="eyebrow">Practise</span><h3>Is this a trigger?</h3><span className="muted" style={{ fontSize: '.86rem' }}>{DRILLS.length} short drills across the four nations.</span></button>
        <button className="scen" onClick={() => onOpen('docs')}><span className="eyebrow">Take away</span><h3>Supplier questions</h3><span className="muted" style={{ fontSize: '.86rem' }}>Build a question list for procurement or an update.</span></button>
        <button className="scen" onClick={() => onOpen('play')}><span className="eyebrow">Play</span><h3>NHS trust casebook</h3><span className="muted" style={{ fontSize: '.86rem' }}>Eight quarters based on real public cases.</span></button>
      </div>
      <div className="card stack"><div className="row" style={{ justifyContent: 'space-between' }}><h3>Deployer checklist</h3><Pill l={doneN === total ? 'lo' : 'ac'}>{doneN} of {total}</Pill></div>
        <p className="muted" style={{ fontSize: '.84rem' }}>A self-check for one product. Ticks are not saved.</p>
        {DUTIES.map(([stage, items]) => (
          <div className="stack" key={stage} style={{ gap: 6 }}><span className="eyebrow">{stage}</span>
            {items.map(t => <label className="chk" key={t}><input type="checkbox" checked={!!ticks[t]} onChange={e => setTicks({ ...ticks, [t]: e.target.checked })} /><span>{t}</span></label>)}
          </div>))}
      </div>
      <Disclaimer />
    </section>
  )
}
