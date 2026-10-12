// Landing page for signed-out visitors. Created by Anthony Onoja, Ph.D., University of Surrey.
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { safeNext } from '../lib/safety'
import { DemoVideo } from '../ui/DemoVideo'

export default function Welcome() {
  const { session } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const q = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
  if (session) return <Navigate to={next} replace />
  return (
    <main className="page welcome"><div className="wrap" style={{ maxWidth: 760 }}>
      <div className="brand" style={{ fontSize: '1.3rem' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" style={{ width: 30, height: 30, color: 'var(--green)' }}><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M12 8v7M8.5 11.5h7" /></svg>RegLife</div>
      <h1 style={{ fontSize: '2rem' }}>Practise the decisions that keep health AI safe and lawful</h1>
      <p className="lead" style={{ fontSize: '1.05rem' }}>Walk through a city of regulators and hospitals, face situations based on real cases, and spot when a change to an AI product changes your legal duties. Built for NHS staff, health technology teams and students across the four UK nations.</p>
      <div className="row"><Link className="btn primary" to={`/signup${q}`} style={{ textDecoration: 'none', padding: '12px 22px' }}>Create a free account</Link><Link className="btn" to={`/login${q}`} style={{ textDecoration: 'none', padding: '12px 22px' }}>Sign in</Link></div>
      <section className="card stack" aria-labelledby="tour">
        <h2 id="tour" style={{ fontSize: '1.15rem' }}>New here? Watch the 2-minute tour first</h2>
        <DemoVideo />
      </section>
      <div className="grid g3">
        <div className="card stack"><h3>Is this a trigger?</h3><p className="muted" style={{ fontSize: '.88rem' }}>Short drills from the deployer's side, with expert reasoning.</p></div>
        <div className="card stack"><h3>Real cases</h3><p className="muted" style={{ fontSize: '.88rem' }}>An NHS trust casebook built from public incidents and rulings.</p></div>
        <div className="card stack"><h3>Take it to work</h3><p className="muted" style={{ fontSize: '.88rem' }}>Leave with a change log, hazard log line or supplier questions.</p></div>
      </div>
      <p className="disc">Created by Anthony Onoja, Ph.D., School of Health Sciences, University of Surrey. Educational tool, not legal advice. <Link to="/privacy">Privacy notice</Link></p>
    </div></main>
  )
}
