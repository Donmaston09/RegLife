// The tour video and poster must ship with the app. Created by Anthony Onoja, Ph.D., University of Surrey.
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEMO_POSTER, DEMO_SRC, DEMO_STEPS } from './DemoVideo'

describe('tour video', () => {
  it('video and poster exist in public/', () => {
    for (const p of [DEMO_SRC, DEMO_POSTER]) {
      const f = resolve(__dirname, '../../public', p.slice(1))
      expect(existsSync(f), p).toBe(true)
    }
  })
  it('video stays small enough for slow NHS networks', () => {
    expect(statSync(resolve(__dirname, '../../public', DEMO_SRC.slice(1))).size).toBeLessThan(8 * 1024 * 1024)
  })
  it('has a written step list as a text alternative', () => {
    expect(DEMO_STEPS.length).toBeGreaterThanOrEqual(5)
  })
})
