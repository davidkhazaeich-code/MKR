import { SOLO_PRICE_1WEEK_LABEL } from '@/lib/pricing-copy'

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
  season: string
  seasonLabel: string
  label: string
  name: string
  monthAbbr: string
  dates: string
  datesFull: string
  startDate: string
  endDate: string
  price: number
  priceCurrency: string
  /** Capacité séparée par discipline. Total = lutte + mma. */
  maxCapacity: SessionCapacity
  spotsLabel: string
  status: SessionStatus
  intensity: string
  duration: string
  destination: 'Daghestan ou Tchétchénie'
}

export const SESSIONS: Session[] = [
  {
    id: 'aout-2026',
    season: 'Été',
    seasonLabel: 'Session Été · Août 2026',
    label: 'AOÛT 2026',
    name: 'CAMP CAUCASIEN',
    monthAbbr: 'AOÛ',
    dates: '17 Août - 5 Septembre',
    datesFull: '17 AOÛT · 5 SEPTEMBRE 2026',
    startDate: '2026-08-17',
    endDate: '2026-09-05',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    spotsLabel: 'Places disponibles',
    status: 'open',
    intensity: 'Maximale',
    duration: '1 à 3 semaines',
    destination: 'Daghestan ou Tchétchénie',
  },
  {
    id: 'toussaint-2026',
    season: 'Automne',
    seasonLabel: 'Session Automne · Toussaint 2026',
    label: 'OCTOBRE 2026',
    name: 'CAMP TOUSSAINT',
    monthAbbr: 'OCT',
    dates: '17 Octobre - 7 Novembre',
    datesFull: '17 OCTOBRE · 7 NOVEMBRE 2026',
    startDate: '2026-10-17',
    endDate: '2026-11-07',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    spotsLabel: 'Places disponibles',
    status: 'open',
    intensity: 'Élevée',
    duration: '1 à 3 semaines',
    destination: 'Daghestan ou Tchétchénie',
  },
  {
    id: 'fevrier-2027',
    season: 'Hiver',
    seasonLabel: 'Session Hiver · Février 2027',
    label: 'FÉVRIER 2027',
    name: 'CAMP HIVER',
    monthAbbr: 'FÉV',
    dates: '13 Février - 6 Mars',
    datesFull: '13 FÉVRIER · 6 MARS 2027',
    startDate: '2027-02-13',
    endDate: '2027-03-06',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    spotsLabel: 'Places disponibles',
    status: 'open',
    intensity: 'Maximale',
    duration: '1 à 3 semaines',
    destination: 'Daghestan ou Tchétchénie',
  },
  {
    id: 'paques-2027',
    season: 'Printemps',
    seasonLabel: 'Session Printemps · Pâques 2027',
    label: 'AVRIL 2027',
    name: 'CAMP PRINTEMPS',
    monthAbbr: 'AVR',
    dates: '3 - 24 Avril',
    datesFull: '3 · 24 AVRIL 2027',
    startDate: '2027-04-03',
    endDate: '2027-04-24',
    price: 2900,
    priceCurrency: 'EUR',
    maxCapacity: { lutte: 15, mma: 15 },
    spotsLabel: 'Places disponibles',
    status: 'open',
    intensity: 'Élevée',
    duration: '1 à 3 semaines',
    destination: 'Daghestan ou Tchétchénie',
  },
]

export function formatPrice(session: Session): string {
  const symbol = session.priceCurrency === 'EUR' ? '€' : session.priceCurrency
  return `${session.price.toLocaleString('fr-FR')} ${symbol}`
}

/**
 * Prix "à partir de" pour une session officielle (1 sem adulte palier Solo/Duo).
 * Utiliser ce helper sur les pages publiques où la durée est variable (1 à 3 sem).
 * Source unique : `PRICING_TIERS.duo.perAdult[1]` via `MIN_PRICE_PER_ADULT_LABEL` n'est pas utilisé ici
 * car on veut le tarif Solo/Duo, pas le min absolu. Voir `SOLO_PRICE_1WEEK_LABEL` dans `lib/pricing-copy.ts`.
 */
export function formatPriceFrom(session: Session): string {
  if (session.priceCurrency !== 'EUR') {
    return `${session.price.toLocaleString('fr-FR')} ${session.priceCurrency}`
  }
  return `À partir de ${SOLO_PRICE_1WEEK_LABEL}`
}

export function sessionFormLabel(session: Session): string {
  const year = session.startDate.slice(0, 4)
  return `${session.season} ${year} (${session.dates})`
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
