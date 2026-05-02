// Source unique de verite pour les compteurs de places des sessions MKR.
// Calcule les places prises a partir de candidatures.status IN ('recue', 'validee', 'soldee')
// pour les candidatures du tunnel 'session' (les autres tunnels ne consomment pas de place).
//
// Le maxCapacity est lu depuis data/sessions.ts pour rester en sync avec la donnee statique.

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SESSIONS, type Session } from '@/data/sessions'

const CONSUMING_STATUSES = ['recue', 'validee', 'soldee'] as const

export interface SessionPlaces {
  session_id: string
  label: string
  dates: string
  max_capacity: number
  places_prises: number
  places_restantes: number
  status: 'open' | 'limited' | 'closed'
  is_full: boolean
}

interface CandidatureCountRow {
  session_id: string | null
}

export async function getAllSessionPlaces(): Promise<SessionPlaces[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select('session_id')
    .eq('tunnel_type', 'session')
    .in('status', CONSUMING_STATUSES as unknown as string[])
    .limit(5000)

  if (error) {
    console.error('[lib/places] query failed', error)
  }

  const counts = new Map<string, number>()
  for (const r of (data ?? []) as CandidatureCountRow[]) {
    if (!r.session_id) continue
    counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1)
  }

  return SESSIONS.map((s: Session) => deriveSessionPlaces(s, counts.get(s.id) ?? 0))
}

export async function getSessionPlaces(sessionId: string): Promise<SessionPlaces | null> {
  const session = SESSIONS.find((s) => s.id === sessionId)
  if (!session) return null

  const supabase = getSupabaseAdmin()
  const { count, error } = await supabase
    .from('candidatures')
    .select('id', { count: 'exact', head: true })
    .eq('tunnel_type', 'session')
    .eq('session_id', sessionId)
    .in('status', CONSUMING_STATUSES as unknown as string[])

  if (error) {
    console.error('[lib/places] count failed', error)
  }

  return deriveSessionPlaces(session, count ?? 0)
}

function deriveSessionPlaces(s: Session, prises: number): SessionPlaces {
  const restantes = Math.max(0, s.maxCapacity - prises)
  const isFull = restantes === 0
  // Override de status : si 0 restantes -> closed, si <= 3 -> limited, sinon le status de la session.
  const liveStatus: SessionPlaces['status'] = isFull
    ? 'closed'
    : restantes <= 3
      ? 'limited'
      : s.status
  return {
    session_id: s.id,
    label: s.label,
    dates: s.dates,
    max_capacity: s.maxCapacity,
    places_prises: prises,
    places_restantes: restantes,
    status: liveStatus,
    is_full: isFull,
  }
}
