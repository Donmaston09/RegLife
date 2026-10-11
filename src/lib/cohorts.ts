import { supabase } from './supabase'
import type { Stats } from '../content/types'

export interface Cohort { id: string; name: string; join_code: string; owner_id: string; created_at: string }
export interface ReportRow { user_id: string; display_name: string; organisation: string; joined_at: string; visited: string[]; updated_at: string | null; runs: { scenario_id: string; score: number; stats: Stats; completed_at: string }[]; drills: Record<string, { correct: boolean; conf: number }>; docs: { type: string; at: string }[] }

const need = () => { if (!supabase) throw new Error('Connect Supabase to use cohorts.'); return supabase }
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function makeCode() {
  const a = new Uint32Array(6); crypto.getRandomValues(a)
  return Array.from(a, n => ALPHABET[n % ALPHABET.length]).join('')
}

export async function myCohorts(uid: string): Promise<Cohort[]> {
  const { data, error } = await need().from('cohorts').select('*').eq('owner_id', uid).order('created_at', { ascending: false })
  if (error) throw error
  return data as Cohort[]
}
export async function createCohort(name: string, uid: string): Promise<Cohort> {
  for (let i = 0; i < 3; i++) {
    const { data, error } = await need().from('cohorts').insert({ name, join_code: makeCode(), owner_id: uid }).select().single()
    if (!error) return data as Cohort
    if (!String(error.message).includes('duplicate')) throw error
  }
  throw new Error('Could not create a unique code. Try again.')
}
export async function deleteCohort(id: string) { const { error } = await need().from('cohorts').delete().eq('id', id); if (error) throw error }
export async function joinCohort(code: string): Promise<{ id: string; name: string }> {
  const { data, error } = await need().rpc('join_cohort', { code })
  if (error) throw error
  return (data as { id: string; name: string }[])[0]
}
export async function myMemberships(uid: string): Promise<{ cohort_id: string; cohorts: { name: string } | null }[]> {
  const { data, error } = await need().from('cohort_members').select('cohort_id, cohorts(name)').eq('user_id', uid)
  if (error) throw error
  return data as unknown as { cohort_id: string; cohorts: { name: string } | null }[]
}
export async function leaveCohort(cid: string, uid: string) { const { error } = await need().from('cohort_members').delete().eq('cohort_id', cid).eq('user_id', uid); if (error) throw error }
export async function cohortReport(cid: string): Promise<ReportRow[]> {
  const { data, error } = await need().rpc('cohort_report', { cid })
  if (error) throw error
  return data as ReportRow[]
}
