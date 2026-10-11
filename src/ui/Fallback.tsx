// 2D city for devices without WebGL, and for people who prefer it. Created by Anthony Onoja, Ph.D., University of Surrey.
import { Component, type ReactNode } from 'react'
import { BUILDINGS } from '../content/city'
import type { District } from '../content/types'
import { KC } from './views'

export function hasWebGL(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

const DISTRICTS: [District, string][] = [['uk', 'UK Borough'], ['eu', 'EU Quarter'], ['own', 'Your Campus'], ['us', 'US Bay'], ['care', 'Care District']]

export function City2D({ active, eventAt, onOpen, note }: { active: string | null; eventAt: string | null; onOpen: (id: string) => void; note?: string }) {
  return (
    <div className="city2d" role="region" aria-label="Map of RegLife city">
      {note && <p className="banner" style={{ gridColumn: '1 / -1' }}>{note}</p>}
      {DISTRICTS.map(([k, n]) => (
        <section key={k} className={`d2 d2-${k}`} aria-label={n}>
          <h2 className="eyebrow">{n}</h2>
          <div className="d2-grid">{BUILDINGS.filter(b => b.k === k).map(b => (
            <button key={b.id} className={`b2${active === b.id ? ' on' : ''}${eventAt === b.id ? ' ev' : ''}`} onClick={() => onOpen(b.id)} style={{ ['--bc' as string]: KC[b.k] }}>
              <span className="ic">{b.code}</span><b>{b.name}</b>{eventAt === b.id && <span className="pill hi">Event here</span>}
            </button>))}</div>
        </section>))}
    </div>
  )
}
