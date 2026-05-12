// Source unique de vérité pour les compteurs de places des sessions MKR.
// Depuis le 2026-05-12, chaque session officielle a 2 capacités séparées :
// 15 places Lutte (Daghestan) + 15 places MMA (Tchétchénie). Le candidat doit
// choisir l'une OU l'autre à l'inscription (combo réservé au sur-mesure).
//
// Places prises = candidatures.status IN ('recue', 'validee', 'soldee')
// pour tunnel_type = 'session', agrégées par (session_id, camp_discipline).

import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SESSIONS, type Session, type CampDiscipline } from '@/data/sessions'

const CONSUMING_STATUSES = ['recue', 'validee', 'soldee'] as const

export interface DisciplinePlaces {
  max_capacity: number
  places_prises: number
  places_restantes: number
  status: 'open' | 'limited' | 'closed'
  is_full: boolean
}

export interface SessionPlaces {
  session_id: string
  label: string
  dates: string
  lutte: DisciplinePlaces
  mma: DisciplinePlaces
  /** Status global : open si l'une des 2 disciplines a au moins 1 place, closed sinon. */
  status: 'open' | 'limited' | 'closed'
  /** Total restant Lutte + MMA. */
  total_restantes: number
  /** Vrai si les 2 disciplines sont pleines. */
  is_full: boolean
}

interface CandidatureCountRow {
  session_id: string | null
  camp_discipline: string | null
}

export async function getAllSessionPlaces(): Promise<SessionPlaces[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select('session_id, camp_discipline')
    .eq('tunnel_type', 'session')
    .in('status', CONSUMING_STATUSES as unknown as string[])
    .limit(5000)

  if (error) {
    console.error('[lib/places] query failed', error)
  }

  // Map<sessionId, { lutte: count, mma: count }>
  const counts = new Map<string, { lutte: number; mma: number }>()
  for (const r of (data ?? []) as CandidatureCountRow[]) {
    if (!r.session_id) continue
    if (r.camp_discipline !== 'lutte' && r.camp_discipline !== 'mma') continue
    const current = counts.get(r.session_id) ?? { lutte: 0, mma: 0 }
    current[r.camp_discipline as CampDiscipline] += 1
    counts.set(r.session_id, current)
  }

  return SESSIONS.map((s: Session) => deriveSessionPlaces(s, counts.get(s.id) ?? { lutte: 0, mma: 0 }))
}

export async function getSessionPlaces(sessionId: string): Promise<SessionPlaces | null> {
  const session = SESSIONS.find((s) => s.id === sessionId)
  if (!session) return null

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('candidatures')
    .select('camp_discipline')
    .eq('tunnel_type', 'session')
    .eq('session_id', sessionId)
    .in('status', CONSUMING_STATUSES as unknown as string[])

  if (error) {
    console.error('[lib/places] count failed', error)
  }

  const counts = { lutte: 0, mma: 0 }
  for (const row of (data ?? []) as { camp_discipline: string | null }[]) {
    if (row.camp_discipline === 'lutte') counts.lutte += 1
    else if (row.camp_discipline === 'mma') counts.mma += 1
  }

  return deriveSessionPlaces(session, counts)
}

function deriveDisciplinePlaces(max: number, prises: number): DisciplinePlaces {
  const restantes = Math.max(0, max - prises)
  const isFull = restantes === 0
  const status: DisciplinePlaces['status'] = isFull
    ? 'closed'
    : restantes <= 3
      ? 'limited'
      : 'open'
  return {
    max_capacity: max,
    places_prises: prises,
    places_restantes: restantes,
    status,
    is_full: isFull,
  }
}

function deriveSessionPlaces(s: Session, prises: { lutte: number; mma: number }): SessionPlaces {
  const lutte = deriveDisciplinePlaces(s.maxCapacity.lutte, prises.lutte)
  const mma = deriveDisciplinePlaces(s.maxCapacity.mma, prises.mma)
  const totalRestantes = lutte.places_restantes + mma.places_restantes
  const isFull = lutte.is_full && mma.is_full
  // Status global :
  // - closed si les 2 sont pleines
  // - limited si total <= 6 (≤ 3 par discipline en moyenne) ou si une discipline est déjà closed
  // - sinon : status de base de la session
  const status: SessionPlaces['status'] = isFull
    ? 'closed'
    : (lutte.is_full || mma.is_full || totalRestantes <= 6)
      ? 'limited'
      : s.status
  return {
    session_id: s.id,
    label: s.label,
    dates: s.dates,
    lutte,
    mma,
    status,
    total_restantes: totalRestantes,
    is_full: isFull,
  }
}
