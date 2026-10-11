import { describe, expect, it } from 'vitest'
import { csvCell, safeNext } from './safety'

describe('csvCell', () => {
  it('neutralises formulas', () => {
    expect(csvCell('=HYPERLINK("http://x","y")')).toBe(`"'=HYPERLINK(""http://x"",""y"")"`)
    for (const s of ['+1', '-1+2', '@SUM(A1)', '\tx']) expect(csvCell(s).startsWith(`"'`)).toBe(true)
  })
  it('leaves ordinary text and numbers alone', () => {
    expect(csvCell('Ann Smith')).toBe('"Ann Smith"'); expect(csvCell(42)).toBe('"42"'); expect(csvCell(null)).toBe('""')
  })
})

describe('safeNext', () => {
  it('allows in-app paths only', () => {
    expect(safeNext('/educator')).toBe('/educator'); expect(safeNext('/join/ABC234')).toBe('/join/ABC234')
    for (const bad of ['//evil.example', 'https://evil.example', '/\\evil.example', 'javascript:alert(1)', '', null]) expect(safeNext(bad)).toBe('/')
  })
})
