import { getUnfinishedSessions, isSessionOpen, sessionFromId, type Session } from '@/data/sessions'
import { frSessionDisplay } from '@/lib/session-display-fr'
import { STATUS_VALUES, type Status } from '@/lib/admin-transitions'
import type { DossierRow, Tone } from '@/lib/admin/types'
import { sessionShortName } from '@/lib/admin/labels'
import { daysBetween, zurichDay } from '@/lib/admin/format'

// Places prises = meme regle que lib/places.ts et l'ancienne liste : tunnel session,
// statuts recue + validee + soldee, par discipline.
const CONSUMING: Status[] = ['recue', 'validee', 'soldee']
const ENGAGED: Status[] = ['validee', 'soldee', 'camp_fait']

export type SessionState = 'a_venir' | 'en_cours' | 'terminee'
export interface PlaceGauge { prises: number; max: number; restantes: number; level: 'ok' | 'limited' | 'full' }
export interface SessionStat {
  id: string; name: string; seasonLabel: string; dates: string; startDate: string; endDate: string
  state: SessionState; daysToStart: number; daysToEnd: number; open: boolean
  lutte: PlaceGauge; mma: PlaceGauge
  byStatus: Record<Status, number>; total: number; active: number
  engagedCents: number; collectedCents: number
}
export interface SessionsOverview {
  current: SessionStat[]
  past: SessionStat[]
  orphans: { id: string; total: number }[]
  surMesure: { total: number; active: number; byStatus: Record<Status, number> }
}

const emptyByStatus = (): Record<Status, number> => Object.fromEntries(STATUS_VALUES.map((s) => [s, 0])) as Record<Status, number>
const gauge = (prises: number, max: number): PlaceGauge => {
  const restantes = Math.max(0, max - prises)
  return { prises, max, restantes, level: restantes === 0 ? 'full' : restantes <= 3 ? 'limited' : 'ok' }
}

function statFor(session: Session, rows: DossierRow[], now: Date): SessionStat {
  const today = zurichDay(now)
  const byStatus = emptyByStatus()
  let lutte = 0, mma = 0, engagedCents = 0, collectedCents = 0
  for (const r of rows) {
    byStatus[r.status] += 1
    if (r.tunnel_type === 'session' && CONSUMING.includes(r.status)) {
      if (r.camp_discipline === 'lutte') lutte += 1
      else if (r.camp_discipline === 'mma') mma += 1
    }
    if (ENGAGED.includes(r.status) && r.package_amount_cents) engagedCents += r.package_amount_cents
    if (r.package_paid_at && r.package_amount_cents) collectedCents += r.package_amount_cents
  }
  const display = frSessionDisplay(session)
  return {
    id: session.id, name: sessionShortName(session), seasonLabel: display.season_label, dates: display.dates_short,
    startDate: session.startDate, endDate: session.endDate,
    state: session.endDate < today ? 'terminee' : session.startDate <= today ? 'en_cours' : 'a_venir',
    daysToStart: daysBetween(today, session.startDate), daysToEnd: daysBetween(today, session.endDate),
    open: isSessionOpen(session.id, now),
    lutte: gauge(lutte, session.maxCapacity.lutte), mma: gauge(mma, session.maxCapacity.mma),
    byStatus, total: rows.length, active: rows.filter((r) => CONSUMING.includes(r.status)).length,
    engagedCents, collectedCents,
  }
}

export function buildSessionsOverview(rows: DossierRow[], now: Date): SessionsOverview {
  const bySession = new Map<string, DossierRow[]>()
  const surMesureRows: DossierRow[] = []
  for (const r of rows) {
    if (!r.session_id) { surMesureRows.push(r); continue }
    const list = bySession.get(r.session_id) ?? []
    list.push(r)
    bySession.set(r.session_id, list)
  }
  const current = getUnfinishedSessions(now).map((s) => statFor(s, bySession.get(s.id) ?? [], now))
  const currentIds = new Set(current.map((s) => s.id))
  const past: SessionStat[] = []
  const orphans: { id: string; total: number }[] = []
  for (const [id, list] of bySession) {
    if (currentIds.has(id)) continue
    const s = sessionFromId(id)
    if (s) past.push(statFor(s, list, now))
    else orphans.push({ id, total: list.length })
  }
  past.sort((a, b) => b.startDate.localeCompare(a.startDate))
  const surByStatus = emptyByStatus()
  for (const r of surMesureRows) surByStatus[r.status] += 1
  return {
    current, past, orphans,
    surMesure: { total: surMesureRows.length, active: surMesureRows.filter((r) => CONSUMING.includes(r.status)).length, byStatus: surByStatus },
  }
}

export function placesSummary(s: Pick<SessionStat, 'lutte' | 'mma'>): string {
  return `Lutte ${s.lutte.prises}/${s.lutte.max} · MMA ${s.mma.prises}/${s.mma.max}`
}

/* Textes de l'ecran Sessions (aucun calcul : mise en mots des chiffres ci-dessus). */

/** Ton d'une jauge : places libres, 3 places ou moins, complet. */
export const GAUGE_TONE: Record<PlaceGauge['level'], Tone> = { ok: 'ok', limited: 'warn', full: 'danger' }

/** "5 places restantes", "1 place restante", "Complet", "Complet, 6 au-dela de la jauge" (accents dans le texte). */
export function gaugeStatus(g: PlaceGauge): string {
  if (g.level === 'full') {
    const over = g.prises - g.max
    return over > 0 ? `Complet, ${over} au-delà de la jauge` : 'Complet'
  }
  return g.restantes > 1 ? `${g.restantes} places restantes` : `${g.restantes} place restante`
}

/** Valeur lue par un lecteur d'ecran : "21 places prises sur 15, complet". */
export function gaugeValueText(g: PlaceGauge): string {
  const taken = `${g.prises} ${g.prises > 1 ? 'places prises' : 'place prise'} sur ${g.max}`
  return g.level === 'full' ? `${taken}, complet` : `${taken}, ${gaugeStatus(g)}`
}

/** "part dans 24 j", "part demain", "part aujourd'hui", "en cours, fin dans 3 j", "termine" (accents dans le texte). */
export function sessionTiming(s: Pick<SessionStat, 'state' | 'daysToStart' | 'daysToEnd'>): string {
  if (s.state === 'terminee') return 'terminé'
  if (s.state === 'en_cours') {
    if (s.daysToStart === 0) return "part aujourd'hui"
    if (s.daysToEnd === 0) return "en cours, fin aujourd'hui"
    return s.daysToEnd === 1 ? 'en cours, fin demain' : `en cours, fin dans ${s.daysToEnd} j`
  }
  return s.daysToStart === 1 ? 'part demain' : `part dans ${s.daysToStart} j`
}
