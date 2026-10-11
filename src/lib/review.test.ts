import { describe, expect, it } from 'vitest'
import { UPDATES, comingUp, recentUpdates, tickerLines } from '../content/updates'
import { BY_ID } from '../content/city'
import { REVIEW_DEFAULT, isDue, reviewOf } from '../content/review'

describe('regulatory updates log', () => {
  it('has unique ids, real dates, sources and valid buildings', () => {
    expect(new Set(UPDATES.map(u => u.id)).size).toBe(UPDATES.length)
    for (const u of UPDATES) {
      expect(u.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(u.date))).toBe(false)
      if (u.kind !== 'app') expect(u.source, u.id).toMatch(/^https:\/\//)
      for (const a of u.affects) expect(BY_ID[a], `${u.id} -> ${a}`).toBeTruthy()
    }
  })
  it('splits past and future around today and feeds the ticker', () => {
    const today = new Date('2026-10-11T12:00:00Z')
    expect(comingUp(today).every(u => u.date > '2026-10-11')).toBe(true)
    expect(recentUpdates(today)[0].date >= recentUpdates(today)[recentUpdates(today).length - 1].date).toBe(true)
    expect(tickerLines(today).length).toBeGreaterThan(2)
  })
})

describe('review records', () => {
  it('defaults to awaiting expert review and becomes due after the interval', () => {
    const r = reviewOf('drill', 'fsn')
    expect(r.status).toBe('awaiting')
    expect(isDue(r, new Date(Date.parse(REVIEW_DEFAULT.lastReviewed) + 100 * 864e5))).toBe(false)
    expect(isDue(r, new Date(Date.parse(REVIEW_DEFAULT.lastReviewed) + 200 * 864e5))).toBe(true)
  })
})
