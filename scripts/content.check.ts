// Monthly content check: stale reviews, review records that point at nothing, and broken source links.
// Run locally with `npm run check:content` (add CHECK_LINKS=1 to test links too).
// Created by Anthony Onoja, Ph.D., University of Surrey.
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FRAMEWORKS } from '../src/content/frameworks'
import { DRILLS } from '../src/content/drills'
import { SCENARIOS } from '../src/content/scenarios'
import { REGULATORS } from '../src/content/regulators'
import { RISKS } from '../src/content/risks'
import { CHANGES } from '../src/content/changes'
import { UPDATES } from '../src/content/updates'
import { REVIEWS, REVIEW_INTERVAL_DAYS, ageDays, isDue, reviewKey, reviewOf, type ContentKind } from '../src/content/review'

type Item = { kind: ContentKind; id: string; label: string; urls: string[] }
const items: Item[] = [
  ...FRAMEWORKS.map(f => ({ kind: 'framework' as const, id: f.n, label: f.n, urls: [f.u] })),
  ...DRILLS.map(d => ({ kind: 'drill' as const, id: d.id, label: d.title, urls: d.refs.map(r => r.url) })),
  ...SCENARIOS.map(s => ({ kind: 'scenario' as const, id: s.id, label: s.title, urls: s.events.flatMap(e => (e.basis ? [e.basis.url] : [])) })),
  ...Object.keys(REGULATORS).map(id => ({ kind: 'regulator' as const, id, label: id, urls: [] })),
  ...RISKS.map(r => ({ kind: 'risk' as const, id: r.n, label: r.n, urls: [] })),
  ...CHANGES.map(c => ({ kind: 'change' as const, id: c.id, label: c.n, urls: [] })),
  ...UPDATES.map(u => ({ kind: 'update' as const, id: u.id, label: u.title, urls: u.source ? [u.source] : [] }))
]

const today = new Date()
const stale = items.filter(i => isDue(reviewOf(i.kind, i.id), today))
const known = new Set(items.map(i => reviewKey(i.kind, i.id)))
const orphans = Object.keys(REVIEWS).filter(k => !known.has(k))
const awaiting = items.filter(i => reviewOf(i.kind, i.id).status === 'awaiting')

async function checkUrl(url: string): Promise<{ url: string; status: number | 'error'; note?: string }> {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'RegLife content check (+https://github.com/Donmaston09/RegLife)' } })
      if (res.ok || method === 'GET') return { url, status: res.status }
    } catch (e) { if (method === 'GET') return { url, status: 'error', note: (e as Error).message } }
  }
  return { url, status: 'error' }
}

describe('content check', () => {
  it('reviews are current, links work, and the report is written', async () => {
    const urls = [...new Set(items.flatMap(i => i.urls))]
    const results = process.env.CHECK_LINKS ? await Promise.all(urls.map(checkUrl)) : []
    const offline = results.length > 0 && results.every(r => r.status === 'error')
    const broken = offline ? [] : results.filter(r => r.status === 'error' || (typeof r.status === 'number' && (r.status === 404 || r.status === 410 || r.status >= 500)))
    const blocked = results.filter(r => typeof r.status === 'number' && [401, 403, 405, 429].includes(r.status))

    const lines = [
      `# RegLife content check, ${today.toISOString().slice(0, 10)}`, '',
      `${items.length} content items. Review interval: ${REVIEW_INTERVAL_DAYS} days.`, '',
      `## Overdue for review (${stale.length})`, '',
      ...(stale.length ? stale.map(i => `- [ ] **${i.kind}**: ${i.label} (last checked ${ageDays(reviewOf(i.kind, i.id), today)} days ago)`) : ['None.']), '',
      `## Broken source links (${broken.length})`, '',
      ...(offline ? ['Link check could not reach the internet, so links were not checked.'] : process.env.CHECK_LINKS ? (broken.length ? broken.map(b => `- [ ] ${b.url} (${b.status}${b.note ? `: ${b.note}` : ''})`) : ['None.']) : ['Not checked (set CHECK_LINKS=1).']), '',
      `## Links that refused automated checking (${blocked.length})`, '',
      ...(blocked.length ? blocked.map(b => `- ${b.url} (${b.status}) - check by hand`) : ['None.']), '',
      `## Review records that match no content (${orphans.length})`, '',
      ...(orphans.length ? orphans.map(k => `- [ ] \`${k}\``) : ['None.']), '',
      `## Still awaiting expert review: ${awaiting.length} of ${items.length}`, '',
      'Record each expert review in `src/content/review.ts`.'
    ]
    writeFileSync(process.env.REPORT_PATH ?? 'content-report.md', lines.join('\n'))

    expect(orphans, 'review records that match no content').toEqual([])
    expect(stale.map(i => `${i.kind}:${i.id}`), 'content overdue for review').toEqual([])
    expect(broken.map(b => b.url), 'broken source links').toEqual([])
  }, 300000)
})
