import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Shell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const { session, signOut } = useAuth()
  return (
    <main className="page"><div className="wrap">
      <nav className="topnav" aria-label="Main">
        <Link to="/" className="brand" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" style={{ width: 24, height: 24, color: 'var(--green)' }}><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M12 8v7M8.5 11.5h7" /></svg>RegLife</Link>
        <span style={{ marginLeft: 'auto' }} />
        <Link to="/">{session ? 'Back to the city' : 'Home'}</Link>
        {session && <><Link to="/account">Account</Link><Link to="/educator">Educator</Link><button className="btn ghost" onClick={signOut}>Sign out</button></>}
      </nav>
      <header className="stack"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></header>
      {children}
      <p className="disc">Created by Anthony Onoja, Ph.D., School of Health Sciences, University of Surrey · donmaston09@gmail.com. Educational tool, not legal advice.</p>
    </div></main>
  )
}

export const NeedsBackend = () => (
  <div className="banner">Accounts, cohorts and the educator dashboard need a Supabase project. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (see the README). Until then RegLife runs in guest mode and saves progress in this browser only.</div>
)
