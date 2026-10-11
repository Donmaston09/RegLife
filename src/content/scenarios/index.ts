import type { Scenario } from '../types'
import { TRIAGEMATE } from './triagemate'
import { MINDMATE } from './mindmate'
import { LUNGSIGHT } from './lungsight'
import { SCRIBEWELL } from './scribewell'
import { CASEBOOK } from './casebook'
import { BASES } from './bases'

const withBases = (s: Scenario): Scenario => ({ ...s, events: s.events.map((e, i) => (e.basis || !BASES[s.id]?.[i] ? e : { ...e, basis: BASES[s.id][i] })) })

export const SCENARIOS: Scenario[] = [CASEBOOK, TRIAGEMATE, MINDMATE, LUNGSIGHT, SCRIBEWELL].map(withBases)
export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map(s => [s.id, s]))
