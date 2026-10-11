import type { Choice, Stats, StatKey } from '../content/types'

export const STATS: [StatKey, string][] = [['safety', 'Patient safety'], ['comp', 'Compliance'], ['trust', 'Trust'], ['cash', 'Runway'], ['speed', 'Velocity']]
export const START_STATS: Stats = { safety: 60, comp: 50, trust: 55, cash: 60, speed: 60 }

const clamp = (v: number) => Math.max(0, Math.min(100, v))

export function applyChoice(s: Stats, c: Choice): Stats {
  const n = { ...s }
  for (const [k, v] of Object.entries(c.d) as [StatKey, number][]) n[k] = clamp(n[k] + v)
  return n
}
export const isBusted = (s: Stats) => STATS.some(([k]) => s[k] <= 0)
/** Regulators judge safety, compliance and trust; runway and velocity only matter for survival. */
export const finalScore = (s: Stats) => Math.round((s.safety + s.comp + s.trust) / 3)
export function grade(score: number): ['lo' | 'mid' | 'hi', string] {
  return score >= 75 ? ['lo', 'Trusted and compliant'] : score >= 55 ? ['mid', 'Survived, with findings'] : ['hi', 'Enforcement action']
}
export function weakest(s: Stats): StatKey {
  return (['safety', 'comp', 'trust'] as StatKey[]).reduce((a, b) => (s[b] < s[a] ? b : a))
}
