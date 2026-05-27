/**
 * Sessions = structural / numeric data only.
 * Display copy (name, label, monthAbbr, dates, intensity, duration, destination)
 * lives in `messages/<locale>/data.sessions.json`.
 *
 * To hydrate a session with translated copy, use `lib/session-display.ts`.
 */

export type SessionStatus = 'open' | 'limited' | 'closed'

export type CampDiscipline = 'lutte' | 'mma'

export interface SessionCapacity {
  /** Places Lutte (Daghestan). Programme adultes + enfants en parallèle. */
  lutte: number
  /** Places MMA (Tchétchénie). Niveau avancé minimum requis. */
  mma: number
}

export interface Session {
  id: string
  /** Stays in TS — used by helpers (year derivation, JSON-LD layout). */
  season: 'Été' | 'Automne' | 'Hiver' | 'Printemps'
  startDate: string
  endDate: string
  price: number
  priceCurrency: string
  /** Capacité séparée par discipline. Total = lutte + mma. */
  maxCapacity: SessionCapacity
  status: SessionStatus
}

export const SESSIONS: Session[] = [
  {
    id: 'aout-2026',
    season: 'Été',
    startDate: '2026-08-17',
    endDate: '2026-09-05',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    status: 'open',
  },
  {
    id: 'toussaint-2026',
    season: 'Automne',
    startDate: '2026-10-17',
    endDate: '2026-11-07',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    status: 'open',
  },
  {
    id: 'fevrier-2027',
    season: 'Hiver',
    startDate: '2027-02-13',
    endDate: '2027-03-06',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    status: 'open',
  },
  {
    id: 'paques-2027',
    season: 'Printemps',
    startDate: '2027-04-03',
    endDate: '2027-04-24',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    status: 'open',
  },
]

/** Locale-independent numeric formatter. Used by API/admin/JSON-LD. */
export function formatPrice(session: Session): string {
  const symbol = session.priceCurrency === 'EUR' ? '€' : session.priceCurrency
  return `${session.price.toLocaleString('fr-FR')} ${symbol}`
}

/**
 * Retourne la prochaine session à venir (la plus proche dans le futur).
 * Fallback : la première session du tableau si aucune n'est dans le futur.
 */
export function getNextSession(now: Date = new Date()): Session {
  const upcoming = SESSIONS.filter(s => new Date(s.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  return upcoming[0] || SESSIONS[0]
}

/** Year derived from startDate, used by recap / form labels. */
export function sessionYear(session: Session): string {
  return session.startDate.slice(0, 4)
}
