import { useSyncExternalStore } from 'react'
import type { Answers, Stats } from '../content/types'
import { DEFAULT_ANSWERS } from '../content/questions'
import { supabase } from './supabase'

export interface Run { scenario_id: string; score: number; stats: Stats; choices: number[]; completed_at: string }
export interface DrillResult { choice: number; conf: number; correct: boolean; at: string }
export interface DocRecord { type: string; at: string }
export interface Progress { visited: string[]; answers: Answers; changes: string[]; runs: Run[]; drills: Record<string, DrillResult>; docs: DocRecord[] }

const KEY = 'reglife.progress.v1'
const empty = (): Progress => ({ visited: [], answers: { ...DEFAULT_ANSWERS }, changes: ['foundation', 'retrain'], runs: [], drills: {}, docs: [] })

function loadLocal(): Progress {
  try { const raw = localStorage.getItem(KEY); if (raw) { const p = { ...empty(), ...JSON.parse(raw) }; p.answers = { ...DEFAULT_ANSWERS, ...p.answers }; return p } } catch { /* storage unavailable */ }
  return empty()
}
function saveLocal(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* storage unavailable */ } }

let state: Progress = loadLocal()
let userId: string | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

let syncTimer: ReturnType<typeof setTimeout> | undefined
function scheduleSync() {
  if (!supabase || !userId) return
  clearTimeout(syncTimer)
  const uid = userId
  syncTimer = setTimeout(async () => {
    await supabase!.from('progress').upsert({ user_id: uid, visited: state.visited, answers: state.answers, changes: state.changes, drills: state.drills, docs: state.docs, updated_at: new Date().toISOString() })
  }, 800)
}
function set(next: Progress) { state = next; saveLocal(state); emit(); scheduleSync() }

export const progressStore = {
  get: () => state,
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } },
  visit(id: string) { if (!state.visited.includes(id)) set({ ...state, visited: [...state.visited, id] }) },
  setAnswer(k: keyof Answers, v: boolean) { set({ ...state, answers: { ...state.answers, [k]: v } }) },
  toggleChange(id: string, on: boolean) { set({ ...state, changes: on ? [...new Set([...state.changes, id])] : state.changes.filter(c => c !== id) }) },
  drill(id: string, r: DrillResult) { set({ ...state, drills: { ...state.drills, [id]: r } }) },
  clearDrill(id: string) { const { [id]: _gone, ...rest } = state.drills; void _gone; set({ ...state, drills: rest }) },
  addDoc(type: string) { set({ ...state, docs: [...state.docs, { type, at: new Date().toISOString() }].slice(-200) }) },
  async addRun(run: Run) {
    set({ ...state, runs: [...state.runs, run] })
    if (supabase && userId) await supabase.from('scenario_runs').insert({ ...run, user_id: userId })
  },
  /** Called when the signed-in user changes. Merges guest progress into the account on first sign-in. */
  async attach(uid: string | null) {
    userId = uid
    if (!supabase || !uid) return
    const [{ data: p }, { data: runs }] = await Promise.all([
      supabase.from('progress').select('visited, answers, changes, drills, docs').eq('user_id', uid).maybeSingle(),
      supabase.from('scenario_runs').select('scenario_id, score, stats, choices, completed_at').eq('user_id', uid).order('completed_at')
    ])
    const local = state
    const remoteRuns = (runs ?? []) as Run[]
    const merged: Progress = {
      visited: [...new Set([...(p?.visited ?? []), ...local.visited])],
      answers: p && Object.keys(p.answers ?? {}).length ? { ...DEFAULT_ANSWERS, ...p.answers } : local.answers,
      changes: p?.changes?.length ? p.changes : local.changes,
      runs: remoteRuns,
      drills: { ...(p?.drills ?? {}), ...local.drills },
      docs: [...(p?.docs ?? []), ...local.docs.filter(d => !(p?.docs ?? []).some((x: DocRecord) => x.at === d.at))]
    }
    // upload guest runs not yet on the server
    const seen = new Set(remoteRuns.map(r => r.completed_at))
    const fresh = local.runs.filter(r => !seen.has(r.completed_at))
    if (fresh.length) {
      await supabase.from('scenario_runs').insert(fresh.map(r => ({ ...r, user_id: uid })))
      merged.runs = [...remoteRuns, ...fresh]
    }
    set(merged)
  },
  reset() { set(empty()) }
}

export const useProgress = () => useSyncExternalStore(progressStore.subscribe, progressStore.get)
