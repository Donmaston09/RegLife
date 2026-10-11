import { describe, expect, it } from 'vitest'
import { classify } from './classify'
import { applyChoice, finalScore, grade, isBusted, START_STATS, weakest } from './scoring'
import { DEFAULT_ANSWERS } from '../content/questions'
import { SCENARIOS } from '../content/scenarios'
import { BY_ID } from '../content/city'
import { FRAMEWORKS } from '../content/frameworks'
import { REGULATORS } from '../content/regulators'

describe('classify', () => {
  it('treats the default TriageMate answers as a high-risk device', () => {
    const r = classify(DEFAULT_ANSWERS)
    expect(r.isDevice).toBe(true)
    expect(r.out.find(o => o.j === 'EU AI Act')?.l).toBe('hi')
    expect(r.out.find(o => o.j === 'US FDA (comparison)')?.v).toMatch(/patients use it directly/)
  })
  it('recognises a wellness app', () => {
    const r = classify({ ...DEFAULT_ANSWERS, wellness: true, medical: false })
    expect(r.isDevice).toBe(false)
    expect(r.out.find(o => o.j === 'US FDA (comparison)')?.l).toBe('lo')
  })
  it('allows non-device CDS when all four FDA criteria hold', () => {
    const r = classify({ ...DEFAULT_ANSWERS, patient: false, review: true, signal: false })
    expect(r.out.find(o => o.j === 'US FDA (comparison)')?.l).toBe('mid')
  })
  it('escalates critical situations', () => {
    expect(classify({ ...DEFAULT_ANSWERS, critical: true }).out[0].v).toMatch(/IIb/)
  })
})

describe('scoring', () => {
  it('clamps stats to 0..100', () => {
    const s = applyChoice(START_STATS, { l: '', r: '', les: '', d: { comp: -500, cash: 500 } })
    expect(s.comp).toBe(0); expect(s.cash).toBe(100); expect(isBusted(s)).toBe(true)
  })
  it('grades and finds the weakest regulator-facing stat', () => {
    expect(finalScore({ safety: 90, comp: 80, trust: 70, cash: 1, speed: 1 })).toBe(80)
    expect(grade(80)[0]).toBe('lo'); expect(grade(40)[0]).toBe('hi')
    expect(weakest({ safety: 50, comp: 20, trust: 60, cash: 0, speed: 0 })).toBe('comp')
  })
})

describe('content integrity', () => {
  it('every scenario event points at a real building and has 2+ choices', () => {
    for (const s of SCENARIOS) for (const e of s.events) {
      expect(BY_ID[e.b], `${s.id} ${e.q}`).toBeTruthy()
      expect(e.o.length).toBeGreaterThanOrEqual(2)
    }
  })
  it('every regulator framework reference exists', () => {
    const names = new Set(FRAMEWORKS.map(f => f.n))
    for (const [id, r] of Object.entries(REGULATORS)) for (const n of r.fw) expect(names.has(n), `${id}: ${n}`).toBe(true)
  })
})
