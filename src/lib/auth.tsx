import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface Profile { id: string; display_name: string; organisation: string }
interface AuthState { session: Session | null; profile: Profile | null; loading: boolean; refreshProfile: () => Promise<void>; signOut: () => Promise<void> }

const Ctx = createContext<AuthState>({ session: null, profile: null, loading: false, refreshProfile: async () => {}, signOut: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(!!supabase)

  async function loadProfile(s: Session | null) {
    if (!supabase || !s) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('id, display_name, organisation').eq('id', s.user.id).maybeSingle()
    setProfile(data as Profile | null)
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await loadProfile(data.session); setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); loadProfile(s) })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <Ctx.Provider value={{
      session, profile, loading,
      refreshProfile: () => loadProfile(session),
      signOut: async () => { await supabase?.auth.signOut() }
    }}>{children}</Ctx.Provider>
  )
}
export const useAuth = () => useContext(Ctx)
