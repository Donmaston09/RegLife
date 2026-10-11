import { describe, expect, it } from 'vitest'
import { DRILLS, LEVELS } from '../content/drills'
import { SCENARIOS, SCENARIO_BY_ID } from '../content/scenarios'
import { RISK_MATRIX, VENDOR_TOPICS, HAZARDS } from '../content/workdocs'
import { BUILDINGS } from '../content/city'
import { toHtml, toText, toCsv } from './docs'

describe('drills', () => {
  it('have unique ids, valid answers and https sources', () => {
    expect(new Set(DRILLS.map(d => d.id)).size).toBe(DRILLS.length)
    for (const d of DRILLS) {
      expect(d.answer).toBeGreaterThanOrEqual(0); expect(d.answer).toBeLessThan(LEVELS.length)
      expect(d.actions.length).toBeGreaterThan(0)
      for (const r of d.refs) expect(r.url).toMatch(/^https:\/\//)
    }
  })
  it('cover all four UK nations and all three response levels', () => {
    for (const n of ['England', 'Scotland', 'Wales', 'Northern Ireland']) expect(DRILLS.some(d => d.nation === n), n).toBe(true)
    for (const l of [0, 1, 2]) expect(DRILLS.some(d => d.answer === l)).toBe(true)
  })
})

describe('real-case content', () => {
  it('every casebook event reveals a sourced real case', () => {
    for (const e of SCENARIO_BY_ID.casebook.events) { expect(e.basis?.url).toMatch(/^https:\/\//); expect(e.basis!.text.length).toBeGreaterThan(40) }
  })
  it('every scenario declares a take-away document and a perspective', () => {
    for (const s of SCENARIOS) { expect(['change', 'hazard', 'vendor']).toContain(s.doc); expect(['manufacturer', 'deployer']).toContain(s.perspective) }
  })
  it('the US is trimmed to the FDA as a comparison', () => {
    expect(BUILDINGS.filter(b => b.k === 'us').map(b => b.id)).toEqual(['fda'])
    expect(BUILDINGS.some(b => b.id === 'trust') && BUILDINGS.some(b => b.id === 'drills') && BUILDINGS.some(b => b.id === 'docs')).toBe(true)
  })
})

describe('work documents', () => {
  it('risk matrix never falls as severity or likelihood rises', () => {
    for (let l = 0; l < 5; l++) for (let s = 0; s < 5; s++) {
      if (s < 4) expect(RISK_MATRIX[l][s + 1]).toBeGreaterThanOrEqual(RISK_MATRIX[l][s])
      if (l < 4) expect(RISK_MATRIX[l + 1][s]).toBeGreaterThanOrEqual(RISK_MATRIX[l][s])
    }
    expect(RISK_MATRIX[0][0]).toBe(1); expect(RISK_MATRIX[4][4]).toBe(5)
  })
  it('question bank and hazard presets are populated', () => {
    expect(VENDOR_TOPICS.reduce((n, t) => n + t.questions.length, 0)).toBeGreaterThan(30)
    expect(HAZARDS.length).toBeGreaterThanOrEqual(8)
  })
  it('escapes learner text in Word output and neutralises CSV formulas', () => {
    const doc = { title: 'T', subtitle: '<script>x</script>', sections: [{ heading: 'H', fields: [['a', '=1+1'] as [string, string]] }] }
    expect(toHtml(doc)).not.toContain('<script>x')
    expect(toText(doc)).toContain('a: =1+1')
    expect(toCsv(['a'], [['=1+1']])).toContain(`"'=1+1"`)
  })
})
