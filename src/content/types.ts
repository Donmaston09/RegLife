export type Jurisdiction = 'EU' | 'UK' | 'US' | 'Intl'
export interface Framework { j: Jurisdiction; t: 'Law' | 'Guidance' | 'Standard' | 'Regulator'; n: string; k: string; w: string; u: string }
export type RoleKey = 'RA' | 'Clin' | 'QA' | 'Legal' | 'UX' | 'DPO' | 'ML' | 'CSO' | 'Mkt' | 'Sec' | 'Proc' | 'Cust'
export interface ChangeType { id: string; g: string; n: string; lvl: 1 | 2 | 3; eu: string; uk: string; us: string; ai: string; data: string; who: RoleKey[] }
export interface Risk { c: string; n: string; s: 'hi' | 'mid'; d: string; ex: string; law: string[]; ctl: string[]; mon: string[] }
export interface Answers { wellness: boolean; medical: boolean; analyse: boolean; individual: boolean; signal: boolean; patient: boolean; review: boolean; critical: boolean; genai: boolean; nhs: boolean }
export type District = 'own' | 'uk' | 'eu' | 'us' | 'care'
export interface Rect { x: number; y: number; w: number; d: number }
export interface Land extends Rect { label: string }
export interface Building extends Rect { id: string; h: number; k: District; code: string; name: string; sub: string }
export interface NoticeBoard { x: number; y: number; t1: string; t2: string; go: string }
export interface Regulator { role: string; meet: string[]; fw: string[]; clk: string[] }

export type StatKey = 'safety' | 'comp' | 'trust' | 'cash' | 'speed'
export type Stats = Record<StatKey, number>
export interface Choice { l: string; d: Partial<Stats>; r: string; les: string }
/** A real public case the event is based on, shown after the learner decides. */
export interface CaseBasis { text: string; url: string }
export interface ScenarioEvent { q: string; b: string; t: string; o: Choice[]; basis?: CaseBasis }
export type DocType = 'change' | 'hazard' | 'vendor'
export type ProductKind = 'triage' | 'chatbot' | 'imaging' | 'scribe' | 'prediction' | 'other'
export interface Scenario { id: string; title: string; product: string; blurb: string; tags: string[]; events: ScenarioEvent[]; doc: DocType; kind: ProductKind; perspective: 'manufacturer' | 'deployer' }

/** Response level in a trigger drill. */
export type DrillLevel = 0 | 1 | 2
export interface Drill { id: string; title: string; role: string; nation: string; context: string; change: string; answer: DrillLevel; reasoning: string; actions: string[]; refs: CaseBasis[] }
