// Records Office: work documents learners take back to their job. Created by Anthony Onoja, Ph.D., University of Surrey.
import { useMemo, useState } from 'react'
import { CHANGES, ROLES } from '../content/changes'
import { HAZARDS, LIKELIHOOD, RATING_LABEL, RISK_MATRIX, SEVERITY, VENDOR_TOPICS } from '../content/workdocs'
import type { DocType, ProductKind } from '../content/types'
import { progressStore, useProgress } from '../lib/progress'
import { downloadBlob, slug, toCsv, toHtml, toText, type WorkDoc } from '../lib/docs'
import { Disclaimer, Pill } from './views'

export interface DocPreset { type: DocType; kind?: ProductKind; product?: string }
const today = () => new Date().toISOString().slice(0, 10)
const plusMonths = (n: number) => { const d = new Date(); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10) }
const KINDS: [ProductKind, string][] = [['triage', 'Triage or symptom checker'], ['chatbot', 'Chatbot or companion'], ['imaging', 'Imaging AI'], ['scribe', 'Ambient scribe'], ['prediction', 'Risk prediction'], ['other', 'Other']]
const DECISIONS = ['Record only. No new assessment needed.', 'Assess and document locally before release. No regulator notification expected.', 'New regulatory assessment or notification needed before release.']

function Preview({ doc }: { doc: WorkDoc }) {
  return (
    <div className="card stack docpreview" aria-label="Document preview">
      <div><h3>{doc.title}</h3><p className="muted" style={{ fontSize: '.84rem' }}>{doc.subtitle}</p></div>
      {doc.sections.map(s => (
        <div key={s.heading} className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">{s.heading}</span>
          {s.text && <p style={{ fontSize: '.88rem' }}>{s.text}</p>}
          {s.fields && <div className="tbl-wrap"><table><tbody>{s.fields.map(([k, v]) => <tr key={k}><th style={{ width: '34%' }}>{k}</th><td>{v || '–'}</td></tr>)}</tbody></table></div>}
          {s.table && <div className="tbl-wrap"><table><thead><tr>{s.table.head.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{s.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
          {s.list && (s.numbered ? <ol className="tight">{s.list.map(i => <li key={i}>{i}</li>)}</ol> : <ul className="tight">{s.list.map(i => <li key={i}>{i}</li>)}</ul>)}
        </div>))}
    </div>
  )
}

function Actions({ doc, type, csv }: { doc: WorkDoc; type: DocType; csv?: string }) {
  const [msg, setMsg] = useState('')
  const name = slug(doc.title + ' ' + doc.subtitle)
  const word = () => { downloadBlob(`${name}.doc`, toHtml(doc), 'application/msword'); progressStore.addDoc(type); setMsg('Downloaded. It opens in Word, Pages or Google Docs.') }
  const copy = async () => { try { await navigator.clipboard.writeText(toText(doc)); progressStore.addDoc(type); setMsg('Copied as text.') } catch { setMsg('Copy did not work here. Use the download instead.') } }
  return (
    <div className="row">
      <button className="btn primary" onClick={word}>Download for Word</button>
      <button className="btn" onClick={copy}>Copy as text</button>
      {csv && <button className="btn" onClick={() => { downloadBlob(`${name}.csv`, csv, 'text/csv'); progressStore.addDoc(type); setMsg('Hazard log row downloaded as CSV.') }}>Download CSV row</button>}
      <span className="ok" aria-live="polite">{msg}</span>
    </div>
  )
}

const Field = ({ id, label, value, set, area }: { id: string; label: string; value: string; set: (v: string) => void; area?: boolean }) => (
  <label className="field"><span>{label}</span>{area ? <textarea id={id} rows={3} value={value} onChange={e => set(e.target.value)} /> : <input id={id} value={value} onChange={e => set(e.target.value)} />}</label>
)

function ChangeLog({ preset }: { preset: DocPreset }) {
  const { changes } = useProgress()
  const [product, setProduct] = useState(preset.product ?? 'TriageMate')
  const [version, setVersion] = useState('v2.4')
  const [desc, setDesc] = useState('')
  const [owner, setOwner] = useState('')
  const [override, setOverride] = useState(-1)
  const [rationale, setRationale] = useState('')
  const sel = CHANGES.filter(c => changes.includes(c.id))
  const auto = Math.max(0, ...sel.map(c => c.lvl - 1))
  const level = override >= 0 ? override : auto
  const who = [...new Set(sel.flatMap(c => c.who))]
  const doc: WorkDoc = {
    title: 'Change impact log entry', subtitle: `${product} ${version} · ${today()}`,
    sections: [
      { heading: 'Summary', fields: [['Product and version', `${product} ${version}`], ['Date', today()], ['Description of change', desc], ['Change owner', owner], ['Next review', plusMonths(3)]] },
      { heading: 'Types of change', list: sel.length ? sel.map(c => c.n) : ['No change types selected'] },
      { heading: 'Impact by regime', table: { head: ['Change', 'UK (MHRA)', 'EU MDR and Northern Ireland', 'EU AI Act', 'Data protection'], rows: sel.map(c => [c.n, c.uk, c.eu, c.ai, c.data]) } },
      { heading: 'Decision', fields: [['Decision', DECISIONS[level]], ['Rationale', rationale || 'To be completed by the change owner.'], ['Suggested by RegLife', DECISIONS[auto]]] },
      { heading: 'Sign-off', table: { head: ['Role', 'Name', 'Date', 'Decision'], rows: (who.length ? who : ['RA', 'QA'] as const).map(r => [ROLES[r], '', '', '']) } },
      { heading: 'Before release', numbered: true, list: ['Update the risk analysis and hazard log', 'Re-verify and re-validate, including subgroups', 'Notify or submit where required', 'Update instructions for use, model card and DPIA', 'Monitor the change closely after release'] }
    ]
  }
  return (
    <div className="stack">
      <p className="muted" style={{ fontSize: '.86rem' }}>Uses the changes you ticked in the Change Control Lab ({sel.length} selected). Tick more there and they appear here.</p>
      <div className="grid g2">
        <Field id="cl-product" label="Product" value={product} set={setProduct} />
        <Field id="cl-version" label="Version or change ID" value={version} set={setVersion} />
        <Field id="cl-owner" label="Change owner" value={owner} set={setOwner} />
        <label className="field"><span>Decision</span><select id="cl-decision" value={override} onChange={e => setOverride(+e.target.value)}><option value={-1}>Use the suggested decision</option>{DECISIONS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></label>
      </div>
      <Field id="cl-desc" label="What is changing" value={desc} set={setDesc} area />
      <Field id="cl-why" label="Rationale for the decision" value={rationale} set={setRationale} area />
      <Preview doc={doc} />
      <Actions doc={doc} type="change" />
    </div>
  )
}

function HazardLog({ preset }: { preset: DocPreset }) {
  const options = useMemo(() => [...HAZARDS].sort((a, b) => Number(!!b.kinds?.includes(preset.kind ?? 'other')) - Number(!!a.kinds?.includes(preset.kind ?? 'other'))), [preset.kind])
  const [pid, setPid] = useState(options[0].id)
  const h = HAZARDS.find(x => x.id === pid)!
  const [over, setOver] = useState<Record<string, string>>({})
  const v = (k: keyof typeof h) => over[`${pid}.${k}`] ?? (h[k] as string)
  const setV = (k: string) => (x: string) => setOver({ ...over, [`${pid}.${k}`]: x })
  const [ref, setRef] = useState('H-001'); const [owner, setOwner] = useState('')
  const [s1, setS1] = useState(3); const [l1, setL1] = useState(2); const [s2, setS2] = useState(3); const [l2, setL2] = useState(1)
  const r1 = RISK_MATRIX[l1][s1], r2 = RISK_MATRIX[l2][s2]
  const product = preset.product ?? 'AI tool'
  const head = ['Ref', 'Hazard', 'Cause', 'Effect', 'Possible harm', 'Existing controls', 'Initial severity', 'Initial likelihood', 'Initial rating', 'Additional controls', 'Residual severity', 'Residual likelihood', 'Residual rating', 'Owner', 'Status']
  const row = [ref, v('title'), v('cause'), v('effect'), v('harm'), v('controls'), SEVERITY[s1], LIKELIHOOD[l1], String(r1), v('extra'), SEVERITY[s2], LIKELIHOOD[l2], String(r2), owner, 'Open']
  const doc: WorkDoc = {
    title: 'Hazard log entry', subtitle: `${product} · ${ref} · ${today()}`,
    sections: [
      { heading: 'Hazard', fields: [['Reference', ref], ['Hazard', v('title')], ['Cause', v('cause')], ['Effect', v('effect')], ['Possible harm', v('harm')]] },
      { heading: 'Initial risk', fields: [['Existing controls', v('controls')], ['Severity', SEVERITY[s1]], ['Likelihood', LIKELIHOOD[l1]], ['Rating', `${r1} · ${RATING_LABEL[r1]}`]] },
      { heading: 'Residual risk', fields: [['Additional controls', v('extra')], ['Severity', SEVERITY[s2]], ['Likelihood', LIKELIHOOD[l2]], ['Rating', `${r2} · ${RATING_LABEL[r2]}`]] },
      { heading: 'Ownership', fields: [['Owner', owner], ['Status', 'Open'], ['Clinical safety officer sign-off', '']] },
      { heading: 'Note', text: 'Ratings use the 5x5 matrix commonly used with DCB0129 and DCB0160. Check against your organisation’s own matrix and definitions.' }
    ]
  }
  const sel = (id: string, label: string, val: number, set: (n: number) => void, opts: readonly string[]) => <label className="field"><span>{label}</span><select id={id} value={val} onChange={e => set(+e.target.value)}>{opts.map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
  return (
    <div className="stack">
      <label className="field"><span>Start from a common AI hazard</span><select id="hz-preset" value={pid} onChange={e => setPid(e.target.value)}>{options.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
      <div className="grid g2">
        <Field id="hz-ref" label="Reference" value={ref} set={setRef} />
        <Field id="hz-owner" label="Owner" value={owner} set={setOwner} />
        <Field id="hz-cause" label="Cause" value={v('cause')} set={setV('cause')} />
        <Field id="hz-effect" label="Effect" value={v('effect')} set={setV('effect')} />
        <Field id="hz-harm" label="Possible harm" value={v('harm')} set={setV('harm')} />
        <Field id="hz-controls" label="Existing controls" value={v('controls')} set={setV('controls')} />
        {sel('hz-s1', 'Initial severity', s1, setS1, SEVERITY)}{sel('hz-l1', 'Initial likelihood', l1, setL1, LIKELIHOOD)}
        <Field id="hz-extra" label="Additional controls" value={v('extra')} set={setV('extra')} />
        <div />
        {sel('hz-s2', 'Residual severity', s2, setS2, SEVERITY)}{sel('hz-l2', 'Residual likelihood', l2, setL2, LIKELIHOOD)}
      </div>
      <div className="row"><span>Initial rating</span><Pill l={r1 >= 4 ? 'hi' : r1 === 3 ? 'mid' : 'lo'}>{r1} · {RATING_LABEL[r1]}</Pill><span>Residual</span><Pill l={r2 >= 4 ? 'hi' : r2 === 3 ? 'mid' : 'lo'}>{r2} · {RATING_LABEL[r2]}</Pill></div>
      <Preview doc={doc} />
      <Actions doc={doc} type="hazard" csv={toCsv(head, [row])} />
    </div>
  )
}

function VendorQs({ preset }: { preset: DocPreset }) {
  const [product, setProduct] = useState(preset.product ?? ''); const [supplier, setSupplier] = useState('')
  const [kind, setKind] = useState<ProductKind>(preset.kind ?? 'other')
  const applicable = VENDOR_TOPICS.filter(t => !t.kinds || t.kinds.includes(kind))
  const [off, setOff] = useState<string[]>([])
  const topics = applicable.filter(t => !off.includes(t.id))
  let n = 0
  const doc: WorkDoc = {
    title: 'Questions for the supplier', subtitle: `${product || 'AI product'}${supplier ? ` · ${supplier}` : ''} · ${today()}`,
    sections: [
      { heading: 'How to use this', text: 'Send these before procurement or before an update goes live. Ask for evidence, not just answers, and keep the replies with your DCB0160 safety case and DPIA.' },
      { heading: 'Questions', table: { head: ['#', 'Topic', 'Question', 'Supplier answer', 'Evidence received'], rows: topics.flatMap(t => t.questions.map(q => [String(++n), t.name, q, '', ''])) } }
    ]
  }
  return (
    <div className="stack">
      <div className="grid g2">
        <Field id="vq-product" label="Product" value={product} set={setProduct} />
        <Field id="vq-supplier" label="Supplier" value={supplier} set={setSupplier} />
        <label className="field"><span>Type of product</span><select id="vq-kind" value={kind} onChange={e => setKind(e.target.value as ProductKind)}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      </div>
      <div className="stack"><span className="eyebrow">Topics to include</span>
        {applicable.map(t => <label className="chk" key={t.id}><input type="checkbox" checked={!off.includes(t.id)} onChange={e => setOff(e.target.checked ? off.filter(x => x !== t.id) : [...off, t.id])} /><span><b>{t.name}</b> · <span className="muted">{t.why}</span></span></label>)}
      </div>
      <Preview doc={doc} />
      <Actions doc={doc} type="vendor" />
    </div>
  )
}

export function WorkDocsView({ preset }: { preset: DocPreset }) {
  const [tab, setTab] = useState<DocType>(preset.type)
  const { docs } = useProgress()
  return (
    <section className="panel">
      <p className="lead">Leave with something you can use at work on Monday. Each document is pre-filled from what you did in the city. Edit it here, then download it for Word or copy it.</p>
      <div className="filters" role="tablist">{([['change', 'Change impact log'], ['hazard', 'Hazard log line'], ['vendor', 'Supplier questions']] as [DocType, string][]).map(([k, l]) => <button key={k} role="tab" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'change' && <ChangeLog preset={preset} />}
      {tab === 'hazard' && <HazardLog preset={preset} />}
      {tab === 'vendor' && <VendorQs preset={preset} />}
      {docs.length > 0 && <p className="muted" style={{ fontSize: '.8rem' }}>You have made {docs.length} document{docs.length === 1 ? '' : 's'} so far.</p>}
      <Disclaimer />
    </section>
  )
}
